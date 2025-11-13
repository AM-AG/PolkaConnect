"""Utility functions for formatting and parsing"""

from typing import Union


def format_balance(value: Union[str, int, float], decimals: int = 10) -> str:
    """
    Format a raw balance value with decimals

    Args:
        value: Raw balance value
        decimals: Number of decimal places

    Returns:
        Formatted balance string
    """
    num = float(value)
    return f"{(num / 10 ** decimals):.4f}"


def format_address(
    address: str, 
    prefix_length: int = 6, 
    suffix_length: int = 4
) -> str:
    """
    Shorten an address for display

    Args:
        address: Full address
        prefix_length: Number of characters to show at start
        suffix_length: Number of characters to show at end

    Returns:
        Shortened address string
    """
    if len(address) <= prefix_length + suffix_length:
        return address
    
    return f"{address[:prefix_length]}...{address[-suffix_length:]}"


def parse_amount(amount: Union[str, int, float], decimals: int = 10) -> str:
    """
    Convert human-readable amount to raw blockchain value

    Args:
        amount: Human-readable amount
        decimals: Number of decimal places

    Returns:
        Raw amount as string
    """
    num = float(amount)
    return str(int(num * 10 ** decimals))
