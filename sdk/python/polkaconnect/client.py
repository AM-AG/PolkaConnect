"""HTTP client for PolkaConnect API"""

import requests
from typing import Any, Dict, Optional


class PolkaConnectClient:
    """Client for interacting with PolkaConnect API"""

    def __init__(self, base_url: str = "https://polkaconnect.replit.app", api_key: Optional[str] = None):
        """
        Initialize PolkaConnect client

        Args:
            base_url: Base URL of the PolkaConnect API
            api_key: Optional API key for authentication
        """
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.session = requests.Session()

        if api_key:
            self.session.headers.update({"X-API-Key": api_key})

    def request(self, method: str, endpoint: str, **kwargs) -> Any:
        """
        Make an HTTP request to the API

        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint
            **kwargs: Additional arguments to pass to requests

        Returns:
            JSON response data

        Raises:
            requests.HTTPError: If the request fails
        """
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        return response.json()

    def get(self, endpoint: str, **kwargs) -> Any:
        """Make a GET request"""
        return self.request("GET", endpoint, **kwargs)

    def post(self, endpoint: str, data: Dict[str, Any], **kwargs) -> Any:
        """Make a POST request"""
        return self.request("POST", endpoint, json=data, **kwargs)
