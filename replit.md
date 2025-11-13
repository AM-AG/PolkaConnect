# PolkaConnect

## Overview

PolkaConnect is a multi-chain control hub for Polkadot (Substrate) and Ethereum (EVM) ecosystems. It enables users to connect Polkadot.js or MetaMask wallets to manage balances, track governance, monitor staking, execute cross-chain swaps, and view live blockchain transactions. The application features a modern UI with grouped sidebar navigation, real-time feeds, and comprehensive wallet integration, aiming to be a production-ready hub with advanced UI/UX and community engagement features. It includes a community page with a leaderboard, live activity feed, community metrics, and a staking pool directory.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript (Vite).
**Routing**: Wouter.
**State Management**: TanStack React Query for caching and server state.
**UI Framework**: shadcn/ui built on Radix UI, styled with Tailwind CSS.
**Design System**: Inter and JetBrains Mono fonts, HSL-based light/dark themes, 12-column responsive grid, card-based UI.
**Key Pages**: Dashboard, Assets, Swap, Transfer (XCM-based DOT transfers), History, Community (leaderboard, activity feed, staking pools), Staking (with analytics & validator recommendations), Governance (with participation metrics), Network (with live XCM activity), Transactions (live feed).
**Resilience**: LocalStorage caching with TTL, fallback to cached data, status banners, client-side data age tracking, null-safe rendering with fallback UI states.

### Backend Architecture

**Framework**: Express.js with TypeScript (Node.js).
**API Endpoints**: `/api/assets/:address`, `/api/governance`, `/api/governance/summary`, `/api/governance/participation/:address`, `/api/network`, `/api/network/xcm`, `/api/transfer/xcm` (POST), `/api/history/:walletAddress`, `/api/stats/community`, `/api/staking/analytics`.
**Data Flow**: Server polls parachain RPCs via Polkadot.js API, caches in-memory (`MemStorage`), falls back to cached data on API errors.
**Error Handling**: Try/catch blocks for blockchain API calls, graceful degradation, connection timeout handling, mock data fallbacks.

### Blockchain Integration

**Polkadot.js API**: WebSocket connections to Polkadot, Astar, and Moonbeam RPC endpoints, with API instance caching and health checks.
**Wallet Integration**: Simultaneous Polkadot.js extension and MetaMask (ethers.js) support. Polkadot.js allows multi-account selection, persistence via localStorage.
**Governance**: 
- Fetches Polkadot OpenGov referenda data, displays vote tallies
- **Governance Engagement Features** (November 2025):
  - Participation metrics dashboard (Total Voters, Total Votes, Participation Rate)
  - Trending proposals section showing top 3 by vote volume
  - User participation tracking with voting power and badges
  - Achievement badges (Active Voter, Governance Expert, Community Leader)
  - Mock data fallback ensures always-functional UI
**Balance Queries**:
    - **Multi-Chain Configuration**: Polkadot (Substrate), Astar (Substrate), Moonbeam (EVM), Ethereum (EVM).
    - **Substrate**: Polkadot.js API `system.account` with SS58 addresses, BigInt modulo for decimal precision.
    - **EVM**: ethers.js `getBalance` with H160 addresses.
    - **Resilience**: `Promise.allSettled` for parallel fetching, cache namespace, status indicators.
**Cross-Chain Messaging (XCM)**: 
- Discovery of active parachains and mapping to known chain names
- XCM-based DOT transfers with destination chain selection (Moonbeam, Astar, Acala, Parallel)
- **Transfer Validation**: Real-time balance verification and Substrate address validation using Polkadot.js utilities
- **Balance Display**: Shows available DOT balance with MAX button for quick-fill
- **Address Validation**: Real-time feedback for destination addresses (green checkmark for valid, red X for invalid)
- **Smart Button States**: Dynamic transfer button with context-aware text ("Insufficient Balance", "Invalid Destination Address", etc.)

**Network Page Enhancements** (November 2025):
- **Dynamic XCM Activity Tracking**: Real-time view of cross-chain transfer activity
  - Displays 5 active parachain transfer routes (Polkadot ↔ Astar, Moonbeam, etc.)
  - Shows transfer counts, 24h volumes, and last transfer timestamps
  - Data refreshes every 30 seconds via `/api/network/xcm`
  - Simulated activity with deterministic data generation
  - Always functional with mock fallbacks

**Staking Page Enhancements** (November 2025):
- **Staking Analytics & Encouragement** (works WITHOUT wallet connection):
  - **Staking Rewards Calculator**: Shows average APY (13.5%), projects daily/monthly/yearly earnings based on bonded amount
  - **Top Validators List**: Displays 5 recommended validators with APY rates, commission fees, nominator counts, and reputation scores
  - **Strategic Layout**: Analytics displayed BEFORE wallet connection prompt to encourage new users to stake
  - Null-safe rendering with graceful fallbacks for partial data
  - Endpoint: `/api/staking/analytics` returns deterministic mock validator data

**Community Features**:
- **Leaderboard System**: Rankings of top community members with XP scoring (votes +10XP, staking +5XP, XCM transfers +20XP)
- **Live Activity Feed**: WebSocket subscription to `system.events` on Polkadot mainnet showing real-time blockchain activity
- **Community Metrics**: Aggregated statistics showing active members, total staked DOT, pool participants, and staking pool count
- **Staking Pool Directory**: Visual catalog of community staking pools with total staked amounts, member counts, and APY percentages
- **Badge System**: Visual indicators for governance participation, staking activity, validator operations, and cross-chain transfers
- **Mock Data Structure**: JSON-based data (`client/src/data/mockCommunity.json`) designed for future integration with on-chain identity queries, staking metrics, and governance participation tracking

### Data Storage

**Database**: PostgreSQL with Drizzle ORM for transaction history.
**In-Memory Storage**: `MemStorage` for caching balances, proposals, network data (development-focused).
**Cache Strategy**: Server-side in-memory, client-side LocalStorage (5-minute TTL), stale-while-revalidate pattern.

### Build and Deployment

**Development**: Vite for frontend (HMR), `tsx` for backend.
**Production**: Vite builds frontend to `dist/public`, `esbuild` bundles backend to `dist/index.js`.
**Configuration**: Environment variables (`DATABASE_URL`), Replit-specific plugins, path aliases.

## External Dependencies

### Blockchain Infrastructure

**Polkadot.js Ecosystem**: `@polkadot/api`, `@polkadot/extension-dapp`, `@polkadot/util`, `@polkadot/util-crypto`.
**RPC Endpoints**: Polkadot (`wss://rpc.polkadot.io`), Astar (`wss://rpc.astar.network`), Moonbeam (`wss://wss.api.moonbeam.network`).

### Database

**PostgreSQL**: Neon Database (serverless) via `@neondatabase/serverless`, Drizzle ORM.

### UI Component Libraries

**Radix UI Primitives**: For accessible UI components.
**shadcn/ui**: Pre-styled components based on Radix UI, customized with Tailwind CSS.

### State Management and Data Fetching

**TanStack React Query**: For declarative data fetching, caching, and background refetching.

### Styling and Design

**Tailwind CSS**: Utility-first CSS framework with custom configuration and dark mode support.
**Fonts**: Google Fonts (Inter, JetBrains Mono).

### Development Tools

**TypeScript**: Strict mode enabled.
**Vite Plugins**: `@vitejs/plugin-react`, `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`.
**Build Tools**: `esbuild`, Vite, `drizzle-kit`.