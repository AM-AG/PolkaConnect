# PolkaConnect Design Guidelines

## Design Approach

**System-Based with Blockchain UI Patterns**: Drawing from established blockchain explorers (Polkadot.js Apps, Subscan, Polkassembly) with systematic design principles for data-heavy dashboards. Focus on clarity, trust, and information density.

## Typography

**Font Stack**:
- Primary: Inter (via Google Fonts) - excellent readability for UI and data
- Monospace: JetBrains Mono - for addresses, hashes, numerical data

**Hierarchy**:
- Hero/Dashboard Title: text-4xl font-bold
- Section Headers: text-2xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Data Labels: text-sm font-medium uppercase tracking-wide
- Numerical Data: text-lg font-mono
- Timestamps/Meta: text-xs text-gray-500

## Layout System

**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 24 (p-2, m-4, gap-6, etc.)

**Grid System**:
- Dashboard: 12-column grid with responsive breakpoints
- Cards: 3-column on desktop (lg:grid-cols-3), 2-column tablet (md:grid-cols-2), 1-column mobile
- Balance Cards: Side-by-side layout with consistent spacing (gap-6)
- Governance List: Single column with generous vertical spacing (space-y-4)

**Container Widths**:
- Main Dashboard: max-w-7xl mx-auto px-6
- Sidebar (if used): w-64 fixed
- Cards: Full width within grid constraints

## Component Library

### Navigation
**Top Navigation Bar** (sticky):
- Left: PolkaConnect logo (text-based with dot icon)
- Center: Main navigation links (Dashboard, Assets, Governance, Network)
- Right: Theme toggle, wallet connection status, connect button
- Background: Elevated card style with border-b
- Height: h-16

### Wallet Connection
**Connect Button**: 
- Large, prominent in navbar
- Shows truncated address when connected (0x1234...5678)
- Dropdown on click: Full address, balance, disconnect option
- Status indicator dot (green = connected, red = disconnected)

### Balance Cards
**Multi-Chain Balance Display**:
- Card layout with chain logo, name, balance
- 3-column grid on desktop
- Each card shows:
  - Chain name and icon (top-left)
  - Large numerical balance (center, font-mono)
  - USD equivalent (below, text-sm)
  - Last updated timestamp (bottom-right, text-xs)
  - Sync button (icon only, top-right)
- Elevated cards with hover lift effect
- Status badge for chain health (top-right corner)

### Governance Section
**Proposal Cards**:
- List layout with alternating subtle backgrounds
- Each proposal shows:
  - Proposal number and title (text-lg font-semibold)
  - Proposer address (truncated, monospace)
  - Status badge (Active/Passed/Rejected with appropriate styling)
  - Vote counts with progress bars
  - Deadline countdown timer
  - Vote buttons (Yes/No) - primary action buttons
- Expandable details section with full description

### Network Visualization
**Interactive Network Map**:
- Full-width section with dark background
- Node visualization using Recharts/D3:
  - Circular nodes representing parachains
  - Size based on market cap or activity
  - Lines connecting nodes (XCM links)
  - Color-coded by health status
- Legend explaining node colors and states
- Tooltips on hover showing:
  - Parachain name
  - Block height
  - Uptime percentage
  - Recent activity

### Data Display Components
**Stat Cards**:
- Compact cards for key metrics
- Large number with icon
- Label below
- Trend indicator (up/down arrow with percentage)

**Tables** (for detailed governance data):
- Striped rows for readability
- Sortable headers
- Monospace for addresses and numbers
- Sticky header on scroll

### Status Indicators
**System-Wide**:
- Sync status banner (top of page when syncing)
- Offline mode indicator (using cached data)
- Chain health dots (green/yellow/red)
- Loading skeletons for async data
- Toast notifications for actions (vote submitted, balance refreshed)

### Buttons & Actions
**Primary Actions**:
- Connect Wallet: Large, high contrast
- Vote Buttons: Medium size, inline in governance cards
- Sync/Refresh: Icon buttons with subtle background

**States**:
- Default, hover, active, disabled, loading
- Loading state shows spinner animation
- Disabled state for unavailable actions (e.g., vote when not connected)

## Responsive Behavior

**Breakpoints**:
- Mobile (<640px): Single column, stacked cards, hamburger menu
- Tablet (640-1024px): 2-column grids, condensed spacing
- Desktop (>1024px): Full 3-column layout, expanded visualizations

**Mobile Optimizations**:
- Bottom navigation bar for key actions
- Swipeable card galleries for balance viewing
- Condensed governance list
- Simplified network map (focus on key nodes)

## Images

**No Hero Image**: This is a dashboard application focused on data and functionality. The landing view should immediately show the wallet connection prompt and dashboard preview.

**Icons & Graphics**:
- Parachain logos (Polkadot, Astar, Moonbeam) in balance cards
- Status icons throughout (checkmarks, warnings, info)
- Empty state illustrations for no wallet connected or no data

## Accessibility

**Requirements**:
- ARIA labels for all interactive elements
- Keyboard navigation for all actions
- Focus indicators on all clickable elements
- Screen reader friendly data tables
- High contrast mode support
- Minimum touch target size of 44x44px

## Animation & Interactions

**Minimal, Purposeful Animations**:
- Card hover lift (subtle transform and shadow)
- Loading skeleton shimmer for data fetching
- Smooth page transitions
- Number count-up animations for balances (when refreshed)
- Pulse animation for sync status indicator
- NO scroll-triggered animations
- NO complex page transitions

## Special Considerations

**Blockchain UI Patterns**:
- Always show connection status prominently
- Use monospace fonts for addresses, hashes, and precise numbers
- Provide copy-to-clipboard for all addresses
- Show transaction confirmations clearly
- Display gas fees and transaction costs upfront
- Include block explorer links for detailed views
- Cache and offline indicators clearly visible

**Trust Signals**:
- Clear data source labels (Polkadot.js, Subscan)
- Last updated timestamps on all data
- Connection security indicators
- Chain verification badges