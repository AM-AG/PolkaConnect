# PolkaConnect SDK (JavaScript/TypeScript)

Cross-chain developer SDK for PolkaConnect - interact with Polkadot and Ethereum ecosystems.

## Installation

```bash
npm install @polkaconnect/sdk
```

## Quick Start

```typescript
import { connectWallet, getWalletBalance, transferTokens } from '@polkaconnect/sdk';

// Connect to Polkadot wallet
const wallet = await connectWallet('polkadot');
console.log('Connected accounts:', wallet.accounts);

// Get balance
const balance = await getWalletBalance('polkadot', 'your-address');
console.log('Balance:', balance.formatted);

// Cross-chain transfer
const result = await transferTokens({
  fromChain: 'polkadot',
  toChain: 'moonbeam',
  address: 'destination-address',
  amount: 100
});
console.log('Transfer result:', result);
```

## API Reference

### Wallet Functions

**`connectWallet(chain: 'polkadot' | 'ethereum')`**
- Connects to the specified wallet extension
- Returns account information

**`getWalletBalance(chain: string, address: string)`**
- Fetches balance for the given address
- Returns formatted balance data

### Transfer Functions

**`transferTokens(params: TransferParams)`**
- Initiates cross-chain token transfer
- Uses XCM for Polkadot parachains

**`swapTokens(params: SwapParams)`**
- Performs token swap
- Returns transaction hash

### Governance Functions

**`getGovernanceProposals()`**
- Fetches active governance proposals
- Returns array of proposals

**`getGovernanceSummary(address?: string)`**
- Gets governance participation metrics
- Optional: user-specific data with address

### Utility Functions

**`formatBalance(value, decimals)`**
- Formats raw balance with decimals

**`formatAddress(address, prefixLength, suffixLength)`**
- Shortens address for display

## Configuration

```typescript
import { PolkaConnectClient } from '@polkaconnect/sdk';

const client = new PolkaConnectClient({
  baseUrl: 'https://your-instance.com',
  apiKey: 'your-api-key' // optional
});

// Use client for requests
const data = await client.get('/api/custom-endpoint');
```

## License

MIT
