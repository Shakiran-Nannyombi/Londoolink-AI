"""
Health check API endpoints.

GET /api/v1/health/token-vault  — checks vault connectivity and returns status
"""

from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.token_vault import get_token_vault_client

router = APIRouter()


# ---------------------------------------------------------------------------
# Response schema
# ---------------------------------------------------------------------------


class TokenVaultHealthResponse(BaseModel):
    status: str          # "ok" | "degraded"
    vault_reachable: bool
    checked_at: datetime


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/token-vault", response_model=TokenVaultHealthResponse)
async def token_vault_health() -> TokenVaultHealthResponse:
    """Check connectivity to the Auth0 Token Vault."""
    client = get_token_vault_client()
    checked_at = datetime.now(tz=timezone.utc)

    try:
        reachable = await client.health_check()
    except Exception:  # noqa: BLE001
        reachable = False

    return TokenVaultHealthResponse(
        status="ok" if reachable else "degraded",
        vault_reachable=reachable,
        checked_at=checked_at,
    )
