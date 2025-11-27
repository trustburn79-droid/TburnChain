# TBURN Blockchain Mainnet Explorer - Comprehensive User Guide

Welcome to the TBURN Blockchain Mainnet Explorer! This guide provides detailed documentation for all features and menu items available in the explorer. Whether you're a developer, validator, or network administrator, this guide will help you navigate and utilize all the powerful tools at your disposal.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Blocks](#blocks)
4. [Transactions](#transactions)
5. [Validators](#validators)
6. [Wallets](#wallets)
7. [Consensus](#consensus)
8. [AI Orchestration](#ai-orchestration)
9. [Sharding](#sharding)
10. [Cross-Shard Communication](#cross-shard-communication)
11. [Smart Contracts](#smart-contracts)
12. [Node Health](#node-health)
13. [Operator Portal](#operator-portal)
    - [Operator Dashboard](#operator-dashboard)
    - [Member Management](#member-management)
    - [Validator Operations](#validator-operations)
    - [Security Audit](#security-audit)
    - [Compliance Reports](#compliance-reports)

---

## Getting Started

### Site Access
- **Site Password**: `tburn7979`
- **Admin Password (Operator Portal)**: `tburn7979`

### Navigation
The explorer uses a sidebar navigation system. All main features are accessible from the left sidebar menu. The Operator Portal has its own dedicated section for administrative functions.

### Real-Time Updates
Most pages feature real-time data updates via WebSocket connections. You'll see "Live" indicators when data is being updated in real-time.

---

## Dashboard

**Path**: `/` (Home)

The Dashboard is your central hub for monitoring the TBURN blockchain network at a glance.

### Features

#### Network Statistics Cards
- **Total Blocks**: Total number of blocks produced on the network
- **Total Transactions**: Cumulative transaction count
- **Active Validators**: Number of validators currently securing the network
- **Network TPS**: Current transactions per second throughput

#### Tokenomics Section
- **Daily Emission**: Shows 5,000 TBURN/day base emission rate
- **Burn Rate**: 20% of emissions are burned, resulting in 4,000 TBURN net daily emission
- **Tier Summaries**: Quick overview of the three validator tiers

#### Latest Blocks
- Displays the most recent blocks with:
  - Block number
  - Block hash
  - Validator address
  - Transaction count
  - Gas used/limit
  - Shard ID
  - Timestamp
- **Interactive**: Click any block to open a detailed modal with full block information
- **"View Full Details" Button**: Navigate to the complete block detail page

#### Latest Transactions
- Shows recent network transactions with:
  - Transaction status (Success/Failed/Pending)
  - Transaction hash
  - From/To addresses
  - Value transferred
  - Block number
  - Gas used/price
  - Nonce and Shard ID
- **Interactive**: Click any transaction to open a detailed modal
- **"View Full Details" Button**: Navigate to the complete transaction detail page

#### Network Activity Charts
- Visual representation of network activity over time
- TPS trends and block production metrics

---

## Blocks

**Path**: `/blocks`

A comprehensive block explorer with advanced filtering and search capabilities.

### Features

#### Block List
- Sortable table displaying all blocks with columns:
  - Block Number
  - Hash
  - Age (time since creation)
  - Validator
  - Transaction Count
  - Shard ID
  - Gas Used
  - Block Size
  - Hash Algorithm (BLAKE3, SHA3-512, SHA-256)

#### Search Functionality
- Search by:
  - Block number
  - Block hash
  - Validator address

#### Filtering Options
- **Validator Filter**: Filter blocks by specific validator
- **Shard Filter**: Filter blocks by shard (Shards 0-4)
- **Hash Algorithm Filter**: Filter by cryptographic hash algorithm used

#### Sorting
- Click column headers to sort by:
  - Block number
  - Timestamp (Age)
  - Transaction count
  - Block size

#### Auto-Refresh Toggle
- **Live Mode**: Automatically updates with new blocks every 5 seconds
- **Paused Mode**: Manual refresh only

#### Export Options
- Export block data to:
  - CSV
  - JSON
  - Excel

#### Pagination
- Navigate through block history with pagination controls
- Shows current range and total block count

---

## Transactions

**Path**: `/transactions`

Browse and explore all transactions on the TBURN network.

### Features

#### Transaction List
- Comprehensive table showing:
  - **Tx Hash**: Unique transaction identifier
  - **Block**: Block number containing the transaction
  - **Age**: Time since transaction was processed
  - **From**: Sender address
  - **To**: Recipient address (or "Contract Creation" for smart contract deployments)
  - **Value**: Amount of TBURN transferred
  - **Gas Used**: Actual gas consumed
  - **Gas Price (EMB)**: Price in Ember units (1 TBURN = 1,000,000 EMB)
  - **Fee (EMB)**: Total transaction fee in Ember
  - **Status**: Success, Failed, or Pending

#### Status Badges
- **Success** (Green): Transaction completed successfully
- **Failed** (Red): Transaction failed during execution
- **Pending** (Gray): Transaction awaiting confirmation

#### Transaction Details
- Click any transaction row to navigate to the full transaction detail page

---

## Validators

**Path**: `/validators`

Monitor and analyze the validator set securing the TBURN network.

### Features

#### Validator Statistics
- **Total Validators**: Count of all network validators
- **Active Validators**: Currently participating validators
- **Total Staked**: Total TBURN locked in validation
- **Average APY**: Network-wide average annual percentage yield

#### Tiered Validator System
The TBURN network uses a three-tier validator structure:

**Tier 1 - Active Committee**
- Maximum: 512 validators
- Minimum Stake: 200,000+ TBURN
- Target APY: 8%
- Pool Share: 50%
- Badge Color: Amber/Gold

**Tier 2 - Standby Validators**
- Maximum: 4,488 validators
- Minimum Stake: 50,000+ TBURN
- Target APY: 4%
- Pool Share: 30%
- Badge Color: Blue

**Tier 3 - Delegators**
- Unlimited participants
- Minimum Stake: 100+ TBURN
- Target APY: 5%
- Pool Share: 20%
- Badge Color: Gray

#### Validator List
Each validator displays:
- Name and address
- Status (Active/Inactive/Jailed)
- Tier badge
- Total stake
- Commission rate
- APY
- Uptime percentage
- Behavior score
- AI Trust Score (adaptive weight)

#### AI-Enhanced Selection
Validators are selected using an AI-Enhanced Committee BFT system that considers:
- Reputation
- Performance metrics
- AI Trust Score

---

## Wallets

**Path**: `/wallets`

Monitor wallet activity and balances across the network.

### Features

#### Wallet Statistics
- **Total Wallets**: Number of registered addresses
- **Total Balance**: Aggregate TBURN across all wallets
- **Total Rewards**: Distributed staking rewards
- **Active Wallets**: Wallets with recent transactions

#### Wallet List
Searchable table with columns:
- **Address**: Wallet address (click to view details)
- **Balance**: Total TBURN balance
- **Staked**: Amount locked in staking (green)
- **Unstaked**: Available liquid balance
- **Rewards**: Earned staking rewards (blue)
- **Transactions**: Transaction count
- **Last Activity**: Timestamp of last transaction

#### Search
- Search wallets by address

#### Real-Time Updates
- WebSocket integration for live balance updates

---

## Consensus

**Path**: `/consensus`

Real-time monitoring of the BFT consensus mechanism.

### Features

#### Consensus Status Banner
- Current consensus round number
- Active phase (Propose, Prevote, Precommit, Commit, Finalize)
- Completed phases count (out of 5)
- Target block time

#### Phase Cards
Visual representation of all 5 consensus phases:
1. **Propose**: Block proposal phase
2. **Prevote**: Initial voting phase
3. **Precommit**: Commitment phase
4. **Commit**: Block commitment phase
5. **Finalize**: Block finalization phase

Each phase shows:
- Phase number and label
- Status (Active/Completed/Pending)
- Phase duration

#### Voting Information
**Prevote Progress**
- Current vote count vs. total validators
- Progress bar showing 2f+1 quorum progress
- Votes needed to reach quorum

**Precommit Progress**
- Similar breakdown for precommit votes
- Visual progress indicator

#### Committee Information
- Current Proposer address
- Total Validators count
- Quorum requirement (2f+1)
- Selection Method: AI-Enhanced

#### Performance Metrics
- **Success Rate**: Percentage of successful consensus rounds (last 10,000)
- **Average Time**: Average block production time in milliseconds
- **Rounds Completed**: Total successful rounds
- **Failed Rounds**: Total failed consensus attempts
- **Timeout Rate**: Percentage of rounds that timed out
- **Early Terminations**: Rounds completed before timeout

---

## AI Orchestration

**Path**: `/ai-orchestration`

Monitor the Triple-Band AI system powering TBURN's intelligent features.

### Features

#### AI Bands
The system uses three AI models in a triple-band configuration:
1. **GPT-5** (OpenAI)
2. **Claude Sonnet 4.5** (Anthropic)
3. **Llama 4** (Meta)

#### Metrics Per Model
- Model weight/priority
- Request counts
- Average response time
- Cost tracking
- Cache hit rate

#### AI Decision Stream
- Real-time feed of AI decisions
- Cross-band interactions
- Feedback learning indicators

#### Cross-Band Learning
- Shows how AI models collaborate and learn from each other

---

## Sharding

**Path**: `/sharding`

Monitor TBURN's dynamic AI-driven sharding system.

### Features

#### Shard Overview
Monitor 5 shards with metrics:
- Shard name and ID
- Status (Active/Syncing/Degraded)
- TPS per shard
- Block height
- Validator count
- Load percentage

#### ML Optimization
- ML optimization score
- Predicted load
- Profiling score
- Capacity utilization

#### AI Recommendations
- Real-time suggestions for shard optimization
- Load balancing recommendations

---

## Cross-Shard Communication

**Path**: `/cross-shard`

Track inter-shard message routing and synchronization.

### Features

#### Message Statistics
- **Pending Messages**: Awaiting confirmation
- **Confirmed**: Successfully transferred
- **Failed**: Requiring retry or investigation
- **Total Gas Used**: Gas consumed by cross-shard operations

#### Shard Topology
Visual overview of the 5-shard network showing:
- Shard status
- TPS per shard
- Block height
- Validator count
- Load percentage

#### Message Queue Table
Detailed view of cross-shard messages:
- **From/To Shards**: Origin and destination
- **Type**: Transfer, Contract Call, State Sync
- **Transaction Hash**: Associated transaction
- **Status**: Confirmed, Pending, Failed
- **Retry Count**: Number of retry attempts
- **Gas Used**: Gas consumed
- **Timestamp**: When message was sent

---

## Smart Contracts

**Path**: `/smart-contracts`

Build, deploy, and explore smart contracts on the TBURN network.

### Features

The page is organized into two tabs:

#### Tab 1: Contract IDE
- Full-featured smart contract editor
- Syntax highlighting and code completion
- Contract compilation and deployment
- Transaction simulation

#### Tab 2: Deployed Contracts

##### Statistics Cards
- **Total Contracts**: Count of deployed contracts
- **Verified Contracts**: Count and percentage of verified contracts
- **Total Interactions**: Sum of all contract transactions

##### Contracts Table
Displays all deployed contracts with:
- **Contract Name**: Human-readable contract identifier
- **Address**: Contract deployment address
- **Creator**: Address that deployed the contract
- **Balance**: Current TBURN balance held by contract
- **Transactions**: Total number of interactions
- **Deployed**: Time since deployment
- **Status**: Verified (green badge) or Unverified (gray badge)

---

## Node Health

**Path**: `/node-health`

Predictive self-healing system monitoring using AI-powered algorithms.

### Features

#### Node Status Card
- **Status Badge**: Healthy (green), Degraded (yellow), or Unhealthy (red)
- **Uptime**: Days, hours, and minutes since last restart
- **Sync Status**: Current synchronization state
- **Last Block**: Seconds since last block received

#### Resource Usage (4 Cards)
- **CPU Usage**: Processor utilization percentage with progress bar
- **Memory Usage**: RAM utilization percentage with progress bar
- **Disk Usage**: Storage consumption percentage with progress bar
- **Network Latency**: Average response time in milliseconds

#### Connection Statistics
- **RPC Connections**: Active HTTP/JSON-RPC connections
- **WebSocket Connections**: Active streaming connections
- **Connected Peers**: P2P network peer count

#### Self-Healing Prediction Algorithms
AI-powered anomaly detection and predictive maintenance with 4 specialized algorithms:

1. **Trend Analysis**
   - Historical pattern recognition
   - Score displayed as percentage with progress bar

2. **Anomaly Detection**
   - Real-time outlier identification
   - Yellow-themed score indicator

3. **Pattern Matching**
   - Known issue pattern recognition
   - Green-themed score indicator

4. **Timeseries Forecast**
   - Predictive analysis for future issues
   - Purple-themed score indicator

Each algorithm displays its current score and description, helping operators identify potential issues before they become critical.

---

## Operator Portal

The Operator Portal provides enterprise-grade administration tools for TBURN network management. Access requires admin authentication.

**Base Path**: `/operator`

---

### Operator Dashboard

**Path**: `/operator`

Central control panel for network operators.

#### Features

##### System Health Cards
Real-time monitoring of:
- Network status
- Active validators
- TPS performance
- System resources

##### KPI Trend Charts
- Visualized network metrics over time
- Performance trend analysis

##### Alert Center
- Severity-based alert queue (Critical, High, Medium, Low)
- Active incident tracking
- Alert management

##### Mainnet Health Monitoring
- Block production status
- TPS metrics and peak TPS history
- Last block timestamp
- Mainnet pause detection (alerts if blocks stall for >1 hour)

##### Recovery Controls
- Remote mainnet restart capability
- Health check endpoint
- Expected recovery time: 30-60 seconds

---

### Member Management

**Path**: `/operator/members`

Comprehensive member administration interface.

#### Features

##### Member List
Paginated table showing:
- Account address
- Display name
- Status (Active, Pending, Suspended, Blacklisted)
- Tier (Basic User, Delegated Staker, Active Validator, Enterprise Validator)
- KYC Level
- AML Risk Score

##### Search & Filtering
- Search by address or name
- Filter by status
- Filter by tier
- Filter by KYC level
- Date range filtering

##### Bulk Actions
When members are selected:
- Change status for multiple members
- Change tier for multiple members
- Clear selection

##### Export
- Export member list to CSV

##### Member Details Modal
5-tab detailed view:

**Overview Tab**
- Display name and legal name
- Status and tier badges
- Creation and update dates

**KYC/AML Tab**
- KYC level and status
- AML risk score
- Compliance information

**Staking Tab**
- Stake amounts
- Delegation details

**Notes Tab**
- View member notes
- Add new notes with timestamps
- Pin/unpin important notes
- Delete notes

**Activity Tab**
- Audit log of actions on member account
- Timeline of changes

##### Individual Actions
- Edit member status
- Change member tier
- Add notes

---

### Validator Operations

**Path**: `/operator/validators`

4-tab system for managing validator lifecycle.

#### Tab 1: Applications

##### Summary Cards
- Pending Applications count
- Under Review count
- Approved This Month

##### Application List
Filterable table showing:
- Applicant name
- Requested tier
- Proposed stake
- Commission rate
- Application status
- Submission date

##### Status Filter
- All, Pending, Under Review, Approved, Rejected

##### Application Review
- Initiate review process for pending applications
- Approve or reject with reasons

---

#### Tab 2: Performance

##### Metrics Cards
- Total Validators
- Average Uptime percentage
- Total Blocks Produced
- Total Rewards Earned

##### Performance Chart
- Bar chart showing top 20 validators by performance score
- Visualizes uptime and performance metrics

##### Performance Leaderboard
Table ranking validators by:
- Rank
- Validator name
- Tier badge
- Total stake
- Uptime percentage
- Blocks produced
- Performance score
- Rewards earned

Click any validator for detailed statistics view.

---

#### Tab 3: Slashing History

##### Summary Cards
- Total Slashing Events
- Total TBURN Slashed
- Pending Executions

##### Slashing Records Table
- Date of slashing
- Validator address
- Slash type
- Amount slashed
- Reason
- Executed by (address)
- Status (Pending/Executed)

---

#### Tab 4: Reward Calculator

##### Calculator Tool
Interactive reward estimator:
- **Tier Selection**: Choose Tier 1, 2, or 3
- **Stake Slider**: Adjust stake amount (100 - 500,000 TBURN)

##### Tier Requirements Display
- Minimum stake requirement
- Target APY
- Pool share percentage
- Maximum validators

##### Estimated Rewards
- Daily estimated reward
- Monthly estimated reward
- Yearly estimated reward
- Effective APY

##### Tier Comparison Table
Side-by-side comparison of all three tiers showing:
- Tier name
- Min stake
- Target APY
- Pool share
- Daily pool allocation

---

### Security Audit

**Path**: `/operator/security`

4-tab security management system.

#### Tab 1: Events

##### Security Event List
Filterable table with columns:
- Event type
- Description
- Target resource
- Severity (Critical, High, Medium, Low)
- Status (Open, Investigating, Resolved)
- Timestamps

##### Filters
- Filter by severity
- Filter by status

##### Event Actions
- View event details
- Mark as investigating
- Resolve event

---

#### Tab 2: Threat Monitor

##### 24-Hour Threat Activity Chart
- Stacked area chart showing threats by severity
- Time-based visualization

##### Severity Distribution
- Pie chart showing breakdown by severity level
- Color-coded (Red=Critical, Orange=High, Yellow=Medium, Green=Low)

##### Geographic Analysis
- Threat source locations
- Regional breakdown

##### Live Threat Feed
Real-time stream showing:
- IP addresses
- Event types
- Descriptions
- Timestamps

---

#### Tab 3: IP Blocklist

##### Statistics Cards
- Total Blocked IPs
- Active Blocks
- Permanent Blocks

##### Blocklist Table
- IP Address
- Block reason
- Blocked by (administrator)
- Blocked at (timestamp)
- Expiration date
- Status (Active/Expired)

##### Actions
- **Block New IP**: Add IP with reason and duration
- **Unblock**: Remove existing blocks

---

#### Tab 4: Audit Logs

##### Admin Action Log
Filterable table showing:
- Action type (formatted for readability)
- Category badge
- Resource affected
- Resource ID
- Risk level (Critical, High, Medium, Low)
- Operator who performed action
- Timestamp

##### Risk Filter
- Filter by risk level

##### Pagination
- Navigate through log history

---

### Compliance Reports

**Path**: `/operator/reports`

4-tab compliance management system.

#### Tab 1: Reports

##### Statistics Cards
- Total Reports
- Draft count
- Pending Review count
- Approved count
- Submitted count

##### Reports List
Filterable table showing:
- Report title
- Type (KYC Summary, Transaction, etc.)
- Status (Draft, Pending Review, Approved, Submitted)
- Period covered
- Created date

##### Filters
- Filter by report type
- Filter by status

##### Actions
- **Generate Report**: Create new report
- **Export CSV**: Export report list

##### Report Type Distribution
- Pie chart showing breakdown by report type

---

#### Tab 2: Templates

##### Template Library
5 pre-configured report templates:

1. **KYC Summary Report**
   - User verification data
   - KYC completion rates

2. **Transaction Monitoring Report**
   - Suspicious activity flags
   - Volume analysis

3. **AML Compliance Report**
   - Anti-money laundering checks
   - Risk assessments

4. **Validator Activity Report**
   - Validator performance metrics
   - Stake changes

5. **Regulatory Filing Report**
   - Compliance documentation
   - Regulatory submissions

Each template shows:
- Name and description
- Report type
- Included fields
- "Use" button to generate from template

---

#### Tab 3: Schedules

##### Statistics Cards
- Active Schedules
- Paused Schedules
- Daily Reports count
- Weekly Reports count

##### Scheduled Reports Table
- Report name
- Frequency (Daily, Weekly, Monthly)
- Next run time
- Last run time
- Recipients
- Status (Enabled/Disabled)

##### Actions
- **Create Schedule**: Set up new automated report
- **Enable/Disable Toggle**: Control schedule status
- **Delete**: Remove schedule

##### New Schedule Creation
- Select template
- Set schedule name
- Choose frequency
- Add recipients

---

#### Tab 4: Compliance

##### Compliance Score
- Overall percentage score
- Progress bar visualization

##### Statistics Cards
- Compliant items count
- Pending items count
- Non-compliant items count

##### Compliance Checklist
Table showing regulatory requirements:
- Category
- Requirement description
- Current status (Compliant, Pending, Non-Compliant)
- Update capability

##### Compliance Breakdown Chart
- Bar chart showing compliance by category
- Visual category analysis

##### Update Compliance Status
- Mark items as compliant/pending/non-compliant
- Track compliance progress

---

## Gas Unit System: Ember (EMB)

TBURN uses a unique gas unit called **Ember (EMB)**:

### Conversion
- **1 TBURN = 1,000,000 Ember (EMB)**

### Standard Gas Prices
| Tier | Price (EMB) | TBURN Equivalent |
|------|-------------|------------------|
| Economy | 5 EMB | 0.000005 TBURN |
| Standard | 10 EMB | 0.00001 TBURN |
| Express | 25 EMB | 0.000025 TBURN |
| Instant | 50 EMB | 0.00005 TBURN |

All transaction fees, gas prices, and estimated costs are displayed in EMB throughout the explorer.

---

## Cryptographic Hash Algorithms

TBURN v7.0 implements a Multi-Hash Cryptographic System supporting:

1. **BLAKE3** - Modern, high-performance hash function
2. **SHA3-512** - NIST standard secure hash algorithm
3. **SHA-256** - Industry-standard cryptographic hash

Blocks display which algorithm was used for their hash computation.

---

## Tips for Operators

1. **Monitor the Alert Center** regularly for critical security events
2. **Review pending validator applications** promptly to maintain network growth
3. **Check slashing history** to identify problematic validators
4. **Use the Reward Calculator** to help validators choose optimal tiers
5. **Schedule automated compliance reports** for regulatory requirements
6. **Keep IP blocklist updated** to prevent known bad actors
7. **Review audit logs** periodically for unauthorized access attempts

---

## Troubleshooting

### Block Not Found
If you see "Block is currently being generated." - this means the block number you're looking for hasn't been produced yet. Wait for network activity or try a lower block number.

### Connection Issues
- Check for the "Live" indicator in the header
- If data isn't updating, try refreshing the page
- Verify WebSocket connection status

### Operator Portal Access
- Ensure you're using the correct admin password: `tburn7979`
- Session expires after inactivity; re-enter password if prompted

---

## Support

For additional support or questions about the TBURN Blockchain Mainnet Explorer, please contact the network administrators or refer to the technical documentation.

---

*Last Updated: November 27, 2025*
*Version: 7.0 (TBURN v7.0 Patent Technologies)*
