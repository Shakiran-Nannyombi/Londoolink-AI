"""
Factory for creating the appropriate TokenVaultClient based on environment.
"""

from __future__ import annotations

from app.core.config import settings

from .client import TokenVaultClient
from .mock_client import MockTokenVaultClient


def get_token_vault_client() -> TokenVaultClient | MockTokenVaultClient:
    """Return a vault client appropriate for the current environment.

    Returns
    -------
    MockTokenVaultClient
        When ``settings.ENVIRONMENT == "development"``.
    TokenVaultClient
        In all other environments.
    """
    if settings.ENVIRONMENT == "development":
        return MockTokenVaultClient()
    return TokenVaultClient()
