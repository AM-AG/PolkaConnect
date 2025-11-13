"""Cross-chain transfer functionality"""

import requests
from typing import Dict, Any


def transfer_tokens(
    from_chain: str,
    to_chain: str,
    address: str,
    amount: float,
    base_url: str = "https://polkaconnect.replit.app"
) -> Dict[str, Any]:
    """
    Perform a cross-chain token transfer using XCM

    Args:
        from_chain: Source chain name (e.g., 'polkadot')
        to_chain: Destination chain name (e.g., 'moonbeam')
        address: Recipient address on destination chain
        amount: Amount to transfer
        base_url: Base URL of the PolkaConnect API

    Returns:
        Transfer result including transaction hash and status

    Raises:
        requests.HTTPError: If the transfer fails
    """
    url = f"{base_url}/api/transfer/xcm"
    payload = {
        "fromChain": from_chain,
        "toChain": to_chain,
        "address": address,
        "amount": amount
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    
    return response.json()
