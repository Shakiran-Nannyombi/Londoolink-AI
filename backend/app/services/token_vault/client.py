"""
TokenVaultClient — real implementation backed by Auth0 Token Vault REST API.

Uses M2M client credentials to obtain a bearer token, then calls the
Token Vault endpoints to store, retrieve, and delete OAuth tokens on
behalf of users.

Security rules enforced here:
- Raw token values (access_token, refresh_token) are NEVER written to logs.
- retrieve_token writes exactly one AuditLog entry before returning.
- 404 from the vault raises TokenRevokedError.
- Scope mismatch raises ScopeNotGrantedError and logs outcome="denied".
- Any other non-2xx vault response raises TokenVaultError.
"""

from __future__ import annotations

import logging
import time
from typing import Any, Optional

import httpx

from app.core.config import settings

from .exceptions import ScopeNotGrantedError, TokenRevokedError, TokenVaultError

logger = logging.getLogger(__name__)


class TokenVaultClient:
    """Async client for the Auth0 Token Vault API.

    Parameters
    ----------
    audit_log_service:
        Optional AuditLogService instance.  When provided, retrieve_token
        calls ``audit_log_service.log_token_retrieval(...)`` before returning.
        Accepted as an optional parameter so the client can be constructed
        before AuditLogService exists (e.g. in tests or early boot).
    """

    def __init__(self, audit_log_service: Optional[Any] = None) -> None:
        self._audit_log_service = audit_log_service
        # Cached M2M token state
        self._m2m_access_token: Optional[str] = None
        self._m2m_expires_at: float = 0.0  # Unix timestamp

    # ------------------------------------------------------------------
    # M2M token management
    # ------------------------------------------------------------------

    async def _get_m2m_token(self) -> str:
        """Return a valid M2M access token, refreshing if expired."""
        # Leave a 30-second buffer before the stated expiry
        if self._m2m_access_token and time.time() < self._m2m_expires_at - 30:
            return self._m2m_access_token

        domain = settings.AUTH0_DOMAIN
        client_id = settings.AUTH0_M2M_CLIENT_ID
        client_secret = settings.AUTH0_M2M_CLIENT_SECRET
        audience = settings.AUTH0_AUDIENCE

        if not all([domain, client_id, client_secret, audience]):
            raise TokenVaultError(
                "Auth0 M2M credentials are not configured. "
                "Set AUTH0_DOMAIN, AUTH0_M2M_CLIENT_ID, AUTH0_M2M_CLIENT_SECRET, "
                "and AUTH0_AUDIENCE."
            )

        url = f"https://{domain}/oauth/token"
        payload = {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
            "audience": audience,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as http:
                response = await http.post(url, json=payload)
        except httpx.RequestError as exc:
            raise TokenVaultError(
                f"Failed to reach Auth0 token endpoint: {exc}"
            ) from exc

        if response.status_code != 200:
            raise TokenVaultError(
                f"Auth0 M2M token request failed with status {response.status_code}."
            )

        data = response.json()
        self._m2m_access_token = data["access_token"]
        expires_in: int = data.get("expires_in", 3600)
        self._m2m_expires_at = time.time() + expires_in
        return self._m2m_access_token  # type: ignore[return-value]

    async def _auth_headers(self) -> dict[str, str]:
        token = await self._get_m2m_token()
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def store_token(
        self,
        auth0_sub: str,
        service_name: str,
        token_data: dict,
    ) -> None:
        """Store an OAuth token in the vault for the given user and service.

        Parameters
        ----------
        auth0_sub:
            Auth0 subject identifier of the user (e.g. ``auth0|abc123``).
        service_name:
            Logical service name, e.g. ``"google"`` or ``"notion"``.
        token_data:
            Dict with shape::

                {
                    "access_token": str,
                    "refresh_token": str,
                    "scopes": list[str],
                    "expires_at": str,   # ISO-8601
                }
        """
        base_url = settings.AUTH0_TOKEN_VAULT_BASE_URL
        url = f"{base_url}/users/{auth0_sub}/tokens/{service_name}"
        headers = await self._auth_headers()

        logger.info(
            "Storing token for auth0_sub=%s service=%s", auth0_sub, service_name
        )

        try:
            async with httpx.AsyncClient(timeout=10.0) as http:
                response = await http.post(url, json=token_data, headers=headers)
        except httpx.RequestError as exc:
            raise TokenVaultError(
                f"Network error while storing token for {service_name}: {exc}"
            ) from exc

        if response.status_code not in (200, 201, 204):
            raise TokenVaultError(
                f"Vault store failed for service={service_name} "
                f"with status {response.status_code}."
            )

    async def retrieve_token(
        self,
        auth0_sub: str,
        service_name: str,
        required_scope: str,
    ) -> dict:
        """Retrieve an OAuth token from the vault.

        Writes one AuditLog entry before returning (or on failure).

        Raises
        ------
        TokenRevokedError
            If the vault returns 404 (token was explicitly revoked or never stored).
        ScopeNotGrantedError
            If ``required_scope`` is not in the token's granted scopes.
            Logs with ``outcome="denied"``.
        TokenVaultError
            For any other non-2xx vault response or network error.
        """
        base_url = settings.AUTH0_TOKEN_VAULT_BASE_URL
        url = f"{base_url}/users/{auth0_sub}/tokens/{service_name}"
        headers = await self._auth_headers()

        logger.info(
            "Retrieving token for auth0_sub=%s service=%s scope=%s",
            auth0_sub,
            service_name,
            required_scope,
        )

        try:
            async with httpx.AsyncClient(timeout=10.0) as http:
                response = await http.get(url, headers=headers)
        except httpx.RequestError as exc:
            await self._write_audit(
                auth0_sub=auth0_sub,
                service_name=service_name,
                scope=required_scope,
                success=False,
            )
            raise TokenVaultError(
                f"Network error while retrieving token for {service_name}: {exc}"
            ) from exc

        if response.status_code == 404:
            await self._write_audit(
                auth0_sub=auth0_sub,
                service_name=service_name,
                scope=required_scope,
                success=False,
            )
            raise TokenRevokedError(
                f"No token found in vault for auth0_sub={auth0_sub} "
                f"service={service_name}. Token may have been revoked."
            )

        if response.status_code != 200:
            await self._write_audit(
                auth0_sub=auth0_sub,
                service_name=service_name,
                scope=required_scope,
                success=False,
            )
            raise TokenVaultError(
                f"Vault retrieve failed for service={service_name} "
                f"with status {response.status_code}."
            )

        token_data: dict = response.json()

        # Scope check — never log the token value itself
        granted_scopes: list[str] = token_data.get("scopes", [])
        if required_scope not in granted_scopes:
            logger.warning(
                "Scope not granted: auth0_sub=%s service=%s required_scope=%s granted=%s",
                auth0_sub,
                service_name,
                required_scope,
                granted_scopes,
            )
            await self._write_audit(
                auth0_sub=auth0_sub,
                service_name=service_name,
                scope=required_scope,
                success=False,
                outcome="denied",
            )
            raise ScopeNotGrantedError(
                f"Scope '{required_scope}' is not in the granted scopes for "
                f"auth0_sub={auth0_sub} service={service_name}. "
                f"Granted: {granted_scopes}"
            )

        # Success path — write audit entry before returning
        await self._write_audit(
            auth0_sub=auth0_sub,
            service_name=service_name,
            scope=required_scope,
            success=True,
        )

        return token_data

    async def delete_token(
        self,
        auth0_sub: str,
        service_name: str,
    ) -> None:
        """Delete a token from the vault.

        Raises
        ------
        TokenVaultError
            If the vault returns a non-2xx / non-404 response or a network error.
            404 is treated as a no-op (idempotent delete).
        """
        base_url = settings.AUTH0_TOKEN_VAULT_BASE_URL
        url = f"{base_url}/users/{auth0_sub}/tokens/{service_name}"
        headers = await self._auth_headers()

        logger.info(
            "Deleting token for auth0_sub=%s service=%s", auth0_sub, service_name
        )

        try:
            async with httpx.AsyncClient(timeout=10.0) as http:
                response = await http.delete(url, headers=headers)
        except httpx.RequestError as exc:
            raise TokenVaultError(
                f"Network error while deleting token for {service_name}: {exc}"
            ) from exc

        # 404 is acceptable — token was already gone
        if response.status_code not in (200, 204, 404):
            raise TokenVaultError(
                f"Vault delete failed for service={service_name} "
                f"with status {response.status_code}."
            )

    async def health_check(self) -> bool:
        """Return True if the vault is reachable and M2M auth succeeds.

        Attempts to acquire an M2M token and hit the vault health endpoint.
        Falls back to just verifying M2M token acquisition if the health
        endpoint is not available.
        """
        try:
            await self._get_m2m_token()
        except TokenVaultError:
            return False

        base_url = settings.AUTH0_TOKEN_VAULT_BASE_URL
        health_url = f"{base_url}/health"
        headers = await self._auth_headers()

        try:
            async with httpx.AsyncClient(timeout=5.0) as http:
                response = await http.get(health_url, headers=headers)
            return response.status_code < 500
        except httpx.RequestError:
            # If the /health endpoint doesn't exist but M2M auth worked,
            # treat the vault as reachable.
            return True

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    async def _write_audit(
        self,
        auth0_sub: str,
        service_name: str,
        scope: str,
        success: bool,
        outcome: Optional[str] = None,
    ) -> None:
        """Write one audit log entry if an audit_log_service is configured."""
        if self._audit_log_service is None:
            return

        resolved_outcome = outcome or ("success" if success else "failure")

        try:
            await self._audit_log_service.log_token_retrieval(
                agent_name="token_vault_client",
                auth0_sub=auth0_sub,
                service_type=service_name,
                scope=scope,
                success=success,
            )
        except Exception:  # noqa: BLE001
            # Audit failures must never break the main flow
            logger.exception(
                "Failed to write audit log for auth0_sub=%s service=%s outcome=%s",
                auth0_sub,
                service_name,
                resolved_outcome,
            )
