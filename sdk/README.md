# PolkaConnect SDK

Official cross-chain developer SDKs for PolkaConnect - enabling seamless interaction with Polkadot and Ethereum ecosystems.

## 🌐 Available SDKs

### JavaScript/TypeScript SDK
**Location:** `/sdk/js`

For web applications and Node.js backends.

```bash
npm install @polkaconnect/sdk
```

[View JavaScript SDK Documentation](./js/README.md)

### Python SDK
**Location:** `/sdk/python`

For backend services, automation, and AI applications.

```bash
pip install polkaconnect-sdk
```

[View Python SDK Documentation](./python/README.md)

## 🚀 Quick Example

### JavaScript
```javascript
import { connectWallet, transferTokens } from '@polkaconnect/sdk';

// Connect wallet
const wallet = await connectWallet('polkadot');

// Transfer tokens cross-chain
const result = await transferTokens({
  fromChain: 'polkadot',
  toChain: 'moonbeam',
  address: '0x...',
  amount: 100
});
```

### Python
```python
from polkaconnect import get_balance, transfer_tokens

# Get balance
balance = get_balance('polkadot', 'your-address')

# Transfer tokens
result = transfer_tokens('polkadot', 'moonbeam', '0x...', 100)
```

## 📚 Features

- ✅ **Wallet Integration**: Connect to Polkadot.js and MetaMask
- ✅ **Cross-Chain Transfers**: XCM-based transfers between parachains
- ✅ **Token Swaps**: Seamless token exchange functionality
- ✅ **Governance**: Query proposals and participation metrics
- ✅ **Balance Queries**: Multi-chain balance aggregation
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Lightweight**: Minimal dependencies, maximum performance

## 🏗️ Architecture

Both SDKs provide:
1. **API Client**: HTTP client for PolkaConnect endpoints
2. **Wallet Module**: Wallet connection and balance queries
3. **Transfer Module**: Cross-chain token transfers
4. **Swap Module**: Token swap functionality
5. **Governance Module**: Proposal queries and voting
6. **Utilities**: Formatting and parsing helpers

## 📖 Documentation

- [JavaScript SDK Docs](./js/README.md)
- [Python SDK Docs](./python/README.md)
- [PolkaConnect API Docs](https://polkaconnect.replit.app/docs)

## 🔧 Development

### Building JavaScript SDK
```bash
cd sdk/js
npm install
npm run build
```

### Building Python SDK
```bash
cd sdk/python
pip install -e .
python setup.py sdist bdist_wheel
```

## 📦 Publishing

### JavaScript (npm)
```bash
cd sdk/js
npm publish --access public
```

### Python (PyPI)
```bash
cd sdk/python
python setup.py sdist bdist_wheel
twine upload dist/*
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [PolkaConnect App](https://polkaconnect.replit.app)
- [GitHub Repository](https://github.com/polkaconnect/sdk)
- [Documentation](https://polkaconnect.replit.app/docs)
- [Support](https://discord.gg/polkaconnect)
