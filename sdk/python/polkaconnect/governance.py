"""Governance proposal queries"""

import requests
from typing import Dict, Any, List, Optional


def get_governance_proposals(
    base_url: str = "https://polkaconnect.replit.app"
) -> List[Dict[str, Any]]:
    """
    Fetch all active governance proposals

    Args:
        base_url: Base URL of the PolkaConnect API

    Returns:
        List of governance proposals

    Raises:
        requests.HTTPError: If the request fails
    """
    url = f"{base_url}/api/governance"
    response = requests.get(url)
    response.raise_for_status()
    
    data = response.json()
    return data.get("data", [])


def get_governance_summary(
    address: Optional[str] = None,
    base_url: str = "https://polkaconnect.replit.app"
) -> Dict[str, Any]:
    """
    Get governance participation summary

    Args:
        address: Optional wallet address for user-specific data
        base_url: Base URL of the PolkaConnect API

    Returns:
        Governance summary including voter stats and trending proposals

    Raises:
        requests.HTTPError: If the request fails
    """
    url = f"{base_url}/api/governance/summary"
    params = {"address": address} if address else {}
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    return response.json()
