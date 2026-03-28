"""
MockTokenVaultClient — in-memory drop-in replacement for TokenVaultClient.

Mirrors the exact async interface of TokenVaultClient so tests and local
development can run without a live Auth0 Token Vault.

Failure injection:
    Pass ``token_data={"__fail__": True, ...}`` to ``store_token`` to make
    subsequent ``retrieve_token`` calls for that key raise ``TokenVaultError``.
"""

from __future__ import annotations

from typing import Any, Optional

from .exceptions import ScopeNotGrantedError, TokenRevokedError, TokenVaultError


class MockTokenVaultClient:
    """In-memory token vault client for testing and local development.

    Parameters
    ----------
    audit_log_service:
        Accepted for interface compatibility with ``TokenVaultClient``.
        Not used internally — all audit entries are written to
        ``self.audit_log`` instead.
    """

    def __init__(self, audit_log_service: Optional[Any] = None) -> None:
        # (auth0_sub, service_name) -> token_data dict
        self._store: dict[tuple[str, str], dict] = {}
        self.audit_log: list[dict] = []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def store_token(
        self,
        auth0_sub: str,
        service_name: str,
        token_data: dict,
    ) -> None:
        """Store a token in the in-memory vault.

        Pass ``token_data={"__fail__": True}`` to simulate a vault failure
        on subsequent ``retrieve_token`` calls for this key.
        """
        self._store[(auth0_sub, service_name)] = token_data

    async def retrieve_token(
        self,
        auth0_sub: str,
        service_name: str,
        required_scope: str,
    ) -> dict:
        """Retrieve a token from the in-memory vault.

        Raises
        ------
        TokenRevokedError
            If the token was never stored or was deleted.
        ScopeNotGrantedError
            If ``required_scope`` is not in the token's ``scopes`` list.
        TokenVaultError
            If the stored token_data contains ``{"__fail__": True}``.
        """
        key = (auth0_sub, service_name)

        if key not in self._store:
            self._record_audit(auth0_sub, service_name, required_scope, success=False, outcome="revoked")
            raise TokenRevokedError(
                f"No token found for auth0_sub={auth0_sub} service={service_name}."
            )

        token_data = self._store[key]

        if token_data.get("__fail__"):
            self._record_audit(auth0_sub, service_name, required_scope, success=False, outcome="failure")
            raise TokenVaultError(
                f"Simulated vault failure for auth0_sub={auth0_sub} service={service_name}."
            )

        granted_scopes: list[str] = token_data.get("scopes", [])
        if required_scope not in granted_scopes:
            self._record_audit(auth0_sub, service_name, required_scope, success=False, outcome="denied")
            raise ScopeNotGrantedError(
                f"Scope '{required_scope}' is not in the granted scopes for "
                f"auth0_sub={auth0_sub} service={service_name}. "
                f"Granted: {granted_scopes}"
            )

        self._record_audit(auth0_sub, service_name, required_scope, success=True, outcome="success")
        return token_data

    async def delete_token(
        self,
        auth0_sub: str,
        service_name: str,
    ) -> None:
        """Remove a token from the in-memory vault (idempotent)."""
        self._store.pop((auth0_sub, service_name), None)

    async def health_check(self) -> bool:
        """Always returns True — the mock is always healthy."""
        return True

    def reset(self) -> None:
        """Clear all stored tokens and audit entries.

        Useful between test cases to ensure a clean state.
        """
        self._store.clear()
        self.audit_log.clear()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _record_audit(
        self,
        auth0_sub: str,
        service_name: str,
        scope: str,
        success: bool,
        outcome: str = "success",
    ) -> None:
        self.audit_log.append(
            {
                "auth0_sub": auth0_sub,
                "service_name": service_name,
                "scope": scope,
                "success": success,
                "outcome": outcome,
            }
        )
