"""Wallet connection and balance queries"""

import requests
from typing import Dict, Any


def connect_wallet(chain: str) -> str:
    """
    Simulate wallet connection (for demonstration)

    In a real implementation, this would integrate with:
    - Polkadot.js extension via browser interface
    - MetaMask via web3.py or similar

    Args:
        chain: Chain name ('polkadot' or 'ethereum')

    Returns:
        Connection confirmation message

    Raises:
        ValueError: If unsupported chain specified
    """
    if chain not in ['polkadot', 'ethereum']:
        raise ValueError(f"Unsupported chain: {chain}")
    return f"Simulated connection to {chain} wallet"


def get_balance(
    chain: str, 
    address: str, 
    base_url: str = "https://polkaconnect.replit.app"
) -> Dict[str, Any]:
    """
    Get wallet balance for a specific chain and address

    Args:
        chain: Chain identifier (e.g., 'polkadot', 'moonbeam')
        address: Wallet address
        base_url: Base URL of the PolkaConnect API

    Returns:
        Balance information including formatted amount and status

    Raises:
        requests.HTTPError: If the API request fails
    """
    url = f"{base_url}/api/balance"
    params = {"chain": chain, "address": address}
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    return response.json()
