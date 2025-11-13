# PolkaConnect SDK (Python)

Cross-chain developer SDK for PolkaConnect - interact with Polkadot and Ethereum ecosystems from Python.

## Installation

```bash
pip install polkaconnect-sdk
```

## Quick Start

```python
from polkaconnect import get_balance, transfer_tokens, get_governance_proposals

# Get wallet balance
balance = get_balance('polkadot', 'your-address')
print(f"Balance: {balance['formatted']}")

# Cross-chain transfer
result = transfer_tokens(
    from_chain='polkadot',
    to_chain='moonbeam',
    address='destination-address',
    amount=100.0
)
print(f"Transfer result: {result}")

# Get governance proposals
proposals = get_governance_proposals()
for proposal in proposals:
    print(f"#{proposal['id']}: {proposal['title']}")
```

## Using the Client

```python
from polkaconnect import PolkaConnectClient

# Initialize client with custom settings
client = PolkaConnectClient(
    base_url='https://your-instance.com',
    api_key='your-api-key'  # optional
)

# Make custom API requests
data = client.get('/api/custom-endpoint')
response = client.post('/api/endpoint', {'key': 'value'})
```

## API Reference

### Wallet Functions

**`get_balance(chain, address, base_url=...)`**
- Fetches balance for the given address
- Returns dict with balance data

**`connect_wallet(chain)`**
- Simulates wallet connection (for demonstration)
- Returns connection confirmation

### Transfer Functions

**`transfer_tokens(from_chain, to_chain, address, amount, base_url=...)`**
- Performs cross-chain transfer using XCM
- Returns transfer result with transaction hash

**`swap_tokens(from_token, to_token, amount, base_url=...)`**
- Performs token swap
- Returns swap result

### Governance Functions

**`get_governance_proposals(base_url=...)`**
- Fetches all active proposals
- Returns list of proposal dicts

**`get_governance_summary(address=None, base_url=...)`**
- Gets participation metrics
- Optional: user-specific data with address

### Utility Functions

**`format_balance(value, decimals=10)`**
- Formats raw balance with decimals

**`format_address(address, prefix_length=6, suffix_length=4)`**
- Shortens address for display

**`parse_amount(amount, decimals=10)`**
- Converts human-readable to raw value

## Development

```bash
# Install in development mode
pip install -e .

# Run tests
python -m pytest

# Build distribution
python setup.py sdist bdist_wheel
```

## License

MIT
