"""
token_vault package — public API surface.
"""

from .client import TokenVaultClient
from .exceptions import (
    ScopeNotGrantedError,
    StepUpRequiredError,
    TokenRevokedError,
    TokenVaultError,
)
from .factory import get_token_vault_client
from .mock_client import MockTokenVaultClient

__all__ = [
    "get_token_vault_client",
    "TokenVaultClient",
    "MockTokenVaultClient",
    "TokenVaultError",
    "TokenRevokedError",
    "ScopeNotGrantedError",
    "StepUpRequiredError",
]
