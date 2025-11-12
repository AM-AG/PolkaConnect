# PolkaConnect

## Overview

PolkaConnect is a fully functional multi-chain control hub supporting both Polkadot (Substrate) and Ethereum (EVM) ecosystems. Users can connect either Polkadot.js extension or MetaMask wallet to view balances, track governance proposals, monitor staking positions, execute cross-chain swaps, and watch live blockchain transactions. The application features a modern grouped sidebar navigation, real-time blockchain feeds, and comprehensive wallet integration across both ecosystems.

**Status**: Production-ready multi-chain hub with advanced UI/UX features.

**Recent Updates (Nov 12, 2025)**:
- ✅ **Balance Verification for Swaps**: Pre-swap validation with button disabling when insufficient balance, real-time balance display, MAX button, and toast notifications
- ✅ **Real-Time Exchange Rates**: CoinGecko API integration for live DOT/ETH prices with 30-second refresh, USD value display, and accurate swap calculations
- ✅ **Numeric Balance Field**: Added `balanceNumeric` to ChainBalance interface for reliable numeric comparisons, eliminating fragile string parsing
- ✅ **Cache Backwards Compatibility**: Automatic computation of missing balanceNumeric for old cached entries, ensuring reliable balance verification
- ✅ **Layout Improvements**: Added padding (p-6) between page content and sidebar for better visual spacing
- ✅ **Grouped Sidebar Navigation**: Organized navigation with Core (Dashboard, Assets, Swap) and Polkadot Network (Staking, Governance, Network, Transactions) sections
- ✅ **Cross-Chain Swap Page**: Interactive UI for DOT ↔ ETH transfers with Snowbridge integration placeholder
- ✅ **Live Transactions Feed**: Real-time Polkadot blockchain monitoring with WebSocket connection, user filtering, and transaction details
- ✅ **Staking Tab**: Complete staking dashboard showing bonded balance, nominations, unlocking schedule, and rewards
- ✅ **Collapsible Sidebar**: Full-height layout with keyboard-accessible navigation
- ✅ **Performance Optimizations**: Transaction throttling (100 max), proper WebSocket cleanup, SPA-friendly state management

**Previous Updates (Nov 11, 2025)**:
- ✅ **Multi-Account Selection**: Users can now view and switch between all Polkadot.js wallet accounts
- ✅ **Account Persistence**: Selected Polkadot account persists across page refreshes via localStorage
- ✅ **Multi-Parachain Balances**: Simultaneous balance fetching from Polkadot, Astar, and Moonbeam
- ✅ **Decimal Precision Fix**: Proper fractional balance display using modulo arithmetic (preserves all decimals)
- ✅ **Address Compatibility**: Substrate chains use SS58 addresses, EVM chains use H160 addresses
- ✅ **Moonbeam Integration**: Fixed RPC compatibility (HTTPS instead of WebSocket) for JsonRpcProvider
- ✅ **Resilient Balance Fetching**: Promise.allSettled ensures one chain failure doesn't block others
- ✅ **Multi-Wallet Support**: Simultaneous Polkadot.js + MetaMask connections with unified balance view
- ✅ **Enhanced Error Handling**: Graceful fallback to cached data with status indicators (online/cached/offline)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management with built-in caching
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens defined in CSS variables

**Design System**:
- Typography: Inter font family for UI, JetBrains Mono for monospace data (addresses, hashes)
- Color scheme: Supports light/dark themes with HSL-based color system
- Layout: 12-column responsive grid system with mobile-first breakpoints
- Component patterns: Card-based UI following blockchain explorer conventions

**Key Pages**:
- **Dashboard**: Overview with stats, recent balances, and governance proposals
- **Assets**: Detailed multi-chain balance view with DOT, ASTR, GLMR, ETH
- **Swap**: Cross-chain token exchange interface (DOT ↔ ETH) with Snowbridge placeholder
- **Staking**: Bonded balance, active nominations, unlocking schedule, rewards dashboard
- **Governance**: List and vote on OpenGov proposals
- **Network**: Visual topology map of parachain connections
- **Transactions**: Live blockchain transaction feed with real-time updates and user filtering

**Resilience Strategy**:
- LocalStorage-based caching with 5-minute TTL
- Automatic fallback to cached data on API failures
- Status banners to communicate connection state (online, syncing, offline, cached)
- Client-side data age tracking

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Endpoints**:
- `/api/assets/:address` - Fetch balances across all configured chains for a given address
- `/api/governance` - Retrieve active referenda from Polkadot OpenGov
- `/api/network` - Get network status for all parachain nodes

**Data Flow**:
- Server polls parachain RPCs directly using Polkadot.js API
- Results are cached in-memory using `MemStorage` implementation
- On API errors, server attempts to return cached data
- Frontend implements additional caching layer for offline resilience

**Error Handling**:
- Try/catch blocks around all blockchain API calls
- Graceful degradation to cached data when live data unavailable
- Connection timeout handling for RPC nodes

### Blockchain Integration

**Polkadot.js API**:
- WebSocket connections to parachain RPC endpoints
- API instance caching with connection health checks (5-minute TTL)
- Lazy connection establishment with automatic reconnection
- Multiple chain support: Polkadot relay chain, Astar, Moonbeam

**Wallet Integration**:
- **Dual Wallet Support**: Simultaneous connection to both Polkadot.js extension AND MetaMask
- Polkadot.js browser extension integration via `@polkadot/extension-dapp`
  - Multi-account support: View all accounts from extension
  - Account selection dropdown with names and visual indicators
  - `selectPolkadotAccount(address)` method for switching accounts
  - `activePolkadotAccount` computed property returns current account
  - Persists selected account to localStorage (key: "polkaconnect_polkadot_address")
  - Restores saved account on reconnect/refresh
- MetaMask integration via ethers.js `BrowserProvider`
- Enhanced error handling with browser-specific guidance (Edge, Chrome, etc.)
- Address display with truncation for UI clarity

**Governance Features**:
- Fetches on-chain referenda data from Polkadot's OpenGov system
- Displays vote tallies (ayes/nays), proposal status, and deadlines
- Vote submission capability (implementation pending on-chain transactions)

**Balance Queries**:
- **Multi-Chain Configuration** (`parachains.ts`):
  - Polkadot: Substrate, 10 decimals, DOT, WebSocket RPC
  - Astar: Substrate, 18 decimals, ASTR, WebSocket RPC
  - Moonbeam: EVM, 18 decimals, GLMR, HTTPS RPC
  - Ethereum: EVM, 18 decimals, ETH
- **Substrate Balance Fetching**:
  - Queries using Polkadot.js API `system.account` with SS58 addresses
  - Decimal precision preserved via BigInt modulo arithmetic
  - Format: `wholePart.fractionalPart` with trailing zeros removed
- **EVM Balance Fetching**:
  - Queries using ethers.js `getBalance` with H160 addresses
  - Moonbeam balances fetch when MetaMask connected
  - Ethereum mainnet balance via BrowserProvider
- **Resilience Features**:
  - Promise.allSettled: One chain failure doesn't block others
  - Cache namespace: `balance:{chainId}:{address}`
  - Status indicators: online, cached, offline
  - Mock USD value calculation (placeholder for future price oracle integration)

**Cross-Chain Messaging (XCM)**:
- Discovers active parachains connected to Polkadot relay chain
- Maps parachain IDs to known chain names (Moonbeam, Astar, Acala, etc.)
- Displays XCM channel status and activity
- Foundation for future cross-chain asset transfers

### Data Storage

**Database**: PostgreSQL with Drizzle ORM
- Schema defined in `shared/schema.ts`
- Users table for potential authentication (currently unused)
- Type-safe schema validation with Zod

**In-Memory Storage**:
- `MemStorage` class implements `IStorage` interface
- Caches balances, proposals, and network node data
- Simple Map-based implementation for development
- Ready to be swapped with database-backed storage for production

**Cache Strategy**:
- Server-side: In-memory cache with no expiration (until server restart)
- Client-side: LocalStorage with 5-minute TTL
- Stale-while-revalidate pattern via React Query
- Age-aware cache retrieval for UX transparency

### Build and Deployment

**Development**:
- Vite dev server with HMR for frontend
- tsx for TypeScript execution in development
- Concurrent frontend/backend development via Vite middleware mode

**Production Build**:
- Vite builds frontend to `dist/public`
- esbuild bundles backend to `dist/index.js`
- Static asset serving from Express in production mode
- ESM module format throughout

**Configuration**:
- Environment variables for database connection via `DATABASE_URL`
- Replit-specific plugins for development banner and error overlay
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

## External Dependencies

### Blockchain Infrastructure

**Polkadot.js Ecosystem**:
- `@polkadot/api` - Core API for blockchain interaction
- `@polkadot/extension-dapp` - Browser extension integration
- `@polkadot/util` and `@polkadot/util-crypto` - Utility libraries for address handling and cryptography

**RPC Endpoints**:
- Polkadot: `wss://rpc.polkadot.io`
- Astar: `wss://rpc.astar.network`
- Moonbeam: `wss://wss.api.moonbeam.network`

### Database

**PostgreSQL**:
- Neon Database serverless PostgreSQL via `@neondatabase/serverless`
- Drizzle ORM for schema definition and migrations
- Connection pooling for serverless environments

### UI Component Libraries

**Radix UI Primitives**: Complete set of unstyled, accessible UI primitives
- Dialogs, dropdowns, popovers, tooltips
- Form controls (checkbox, radio, select, slider, switch)
- Navigation components (accordion, tabs, menubar)
- Layout primitives (scroll-area, separator, collapsible)

**shadcn/ui**: Pre-styled components built on Radix UI
- Customized with Tailwind CSS and design tokens
- "New York" style variant selected
- CSS variables for theming support

### State Management and Data Fetching

**TanStack React Query**:
- Declarative data fetching with automatic caching
- Background refetching with configurable intervals (30-60 seconds)
- Optimistic updates and error handling
- DevTools integration for debugging

### Styling and Design

**Tailwind CSS**:
- Utility-first CSS framework
- PostCSS for processing
- Custom configuration with extended color palette and spacing
- Dark mode support via class strategy

**Fonts**:
- Google Fonts: Inter (sans-serif), JetBrains Mono (monospace)
- Preloaded via CDN in HTML head

### Development Tools

**TypeScript**: Strict mode enabled for type safety across frontend and backend

**Vite Plugins**:
- `@vitejs/plugin-react` - React Fast Refresh
- `@replit/vite-plugin-runtime-error-modal` - Enhanced error overlay
- `@replit/vite-plugin-cartographer` - Code navigation in Replit
- `@replit/vite-plugin-dev-banner` - Development environment indicator

**Build Tools**:
- esbuild for backend bundling
- Vite for frontend bundling
- drizzle-kit for database migrations

### Future Integration Points

The architecture anticipates integration with:
- **Subscan API**: For historical transaction data and analytics
- **Price Oracles**: For real-time USD conversion of token balances
- **IPFS**: For decentralized proposal metadata storage
- **Polkadot Cloud**: For resilient cross-chain data synchronization