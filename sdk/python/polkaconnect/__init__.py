"""PolkaConnect SDK for Python

Cross-chain developer SDK for interacting with Polkadot and Ethereum ecosystems.
"""

from .wallet import connect_wallet, get_balance
from .swap import swap_tokens
from .transfer import transfer_tokens
from .governance import get_governance_proposals, get_governance_summary
from .client import PolkaConnectClient

__version__ = "1.0.0"
__all__ = [
    "connect_wallet",
    "get_balance",
    "swap_tokens",
    "transfer_tokens",
    "get_governance_proposals",
    "get_governance_summary",
    "PolkaConnectClient",
]
