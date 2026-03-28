"""
Exceptions for the Token Vault service layer.

TokenVaultError and its subclasses represent vault operation failures.
StepUpRequiredError is a separate hierarchy — it represents an auth challenge,
not a vault failure.
"""


class TokenVaultError(Exception):
    """Generic vault failure. Base class for vault-related exceptions."""


class TokenRevokedError(TokenVaultError):
    """Raised when a token has been explicitly revoked."""


class ScopeNotGrantedError(TokenVaultError):
    """Raised when the requested scope is not in the token's granted set."""


class StepUpRequiredError(Exception):
    """
    Raised when a high-stakes action requires step-up authentication.

    Intentionally NOT a subclass of TokenVaultError — this represents
    an auth challenge, not a vault failure.
    """
