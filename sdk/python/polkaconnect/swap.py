"""Token swap functionality"""

import requests
from typing import Dict, Any


def swap_tokens(
    from_token: str,
    to_token: str,
    amount: float,
    base_url: str = "https://polkaconnect.replit.app"
) -> Dict[str, Any]:
    """
    Perform a token swap

    Args:
        from_token: Source token symbol
        to_token: Destination token symbol
        amount: Amount to swap
        base_url: Base URL of the PolkaConnect API

    Returns:
        Swap result including transaction hash and status

    Raises:
        requests.HTTPError: If the swap fails
    """
    url = f"{base_url}/api/swap"
    payload = {
        "from": from_token,
        "to": to_token,
        "amount": amount
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    
    return response.json()
