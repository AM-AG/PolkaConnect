# PolkaConnect

## Overview

PolkaConnect is a multi-chain dashboard application for the Polkadot ecosystem that enables users to view balances across parachains (Polkadot, Astar, Moonbeam), track governance proposals, vote on referenda, and visualize parachain network topology. The application is designed with resilience in mind, implementing fallback mechanisms and caching to maintain functionality even when individual chains or RPC nodes fail.

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
- Dashboard: Overview with stats, recent balances, and governance proposals
- Assets: Detailed multi-chain balance view
- Governance: List and vote on OpenGov proposals
- Network: Visual topology map of parachain connections

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
- Polkadot.js browser extension integration via `@polkadot/extension-dapp`
- Multi-account support with account selection
- LocalStorage persistence of wallet connection state
- Address display with truncation for UI clarity

**Governance Features**:
- Fetches on-chain referenda data from Polkadot's OpenGov system
- Displays vote tallies (ayes/nays), proposal status, and deadlines
- Vote submission capability (implementation pending on-chain transactions)

**Balance Queries**:
- Queries native token balances using `system.account` for each configured chain
- Converts on-chain balance units to human-readable decimals
- Mock USD value calculation (placeholder for future price oracle integration)
- Block height tracking for chain status verification

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