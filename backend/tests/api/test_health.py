"""
Unit tests for GET /api/v1/health/token-vault endpoint.

Verifies the correct response shape and status values for both
reachable and unreachable vault scenarios.
"""

from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def _mock_vault(health_result):
    """Return a context manager that patches get_token_vault_client."""
    mock_client = AsyncMock()
    mock_client.health_check = AsyncMock(return_value=health_result)
    return patch(
        "app.api.endpoints.health.get_token_vault_client",
        return_value=mock_client,
    )


class TestTokenVaultHealth:
    def test_returns_ok_when_vault_reachable(self, client):
        with _mock_vault(True):
            response = client.get("/api/v1/health/token-vault")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["vault_reachable"] is True
        assert "checked_at" in data

    def test_returns_degraded_when_vault_unreachable(self, client):
        with _mock_vault(False):
            response = client.get("/api/v1/health/token-vault")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["vault_reachable"] is False
        assert "checked_at" in data

    def test_returns_degraded_when_health_check_raises(self, client):
        mock_client = AsyncMock()
        mock_client.health_check = AsyncMock(side_effect=Exception("vault down"))

        with patch(
            "app.api.endpoints.health.get_token_vault_client",
            return_value=mock_client,
        ):
            response = client.get("/api/v1/health/token-vault")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["vault_reachable"] is False

    def test_response_shape_has_required_fields(self, client):
        with _mock_vault(True):
            response = client.get("/api/v1/health/token-vault")

        data = response.json()
        assert set(data.keys()) == {"status", "vault_reachable", "checked_at"}

    def test_checked_at_is_iso_datetime(self, client):
        from datetime import datetime

        with _mock_vault(True):
            response = client.get("/api/v1/health/token-vault")

        checked_at = response.json()["checked_at"]
        # Should parse without error
        dt = datetime.fromisoformat(checked_at.replace("Z", "+00:00"))
        assert dt is not None
