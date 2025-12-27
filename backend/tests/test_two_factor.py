import pytest
import pyotp
from fastapi import status
from unittest.mock import patch, Mock

class TestTwoFactorAuth:
    def test_get_2fa_status_unauthorized(self, client):
        """Test getting 2FA status without authentication."""
        response = client.get("/api/v1/2fa/status")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_2fa_status_success(self, client, auth_headers):
        """Test getting 2FA status with authentication."""
        response = client.get("/api/v1/2fa/status", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "enabled" in data
        assert data["enabled"] is False

    def test_enable_2fa_wrong_password(self, client, auth_headers):
        """Test enabling 2FA with incorrect password."""
        response = client.post(
            "/api/v1/2fa/enable",
            json={"password": "wrongpassword"},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Invalid password" in response.json()["detail"]

    def test_enable_2fa_success(self, client, auth_headers):
        """Test initiating 2FA enrollment."""
        response = client.post(
            "/api/v1/2fa/enable",
            json={"password": "testpassword123"},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "secret" in data
        assert "qr_code" in data
        assert "backup_codes" in data
        assert len(data["backup_codes"]) == 10

    def test_verify_2fa_setup_invalid_code(self, client, auth_headers):
        """Test verifying 2FA setup with invalid code."""
        # First enable to set a secret
        client.post(
            "/api/v1/2fa/enable",
            json={"password": "testpassword123"},
            headers=auth_headers
        )
        
        response = client.post(
            "/api/v1/2fa/verify",
            json={"code": "000000"},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid verification code" in response.json()["detail"]

    def test_verify_2fa_setup_success(self, client, auth_headers, test_user):
        """Test successful 2FA verification."""
        # Enable and get secret
        resp = client.post(
            "/api/v1/2fa/enable",
            json={"password": "testpassword123"},
            headers=auth_headers
        )
        secret = resp.json()["secret"]
        
        # Generate valid TOTP code
        totp = pyotp.TOTP(secret)
        valid_code = totp.now()
        
        response = client.post(
            "/api/v1/2fa/verify",
            json={"code": valid_code},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["message"] == "2FA enabled successfully"
        
        # Verify status now shows enabled
        status_resp = client.get("/api/v1/2fa/status", headers=auth_headers)
        assert status_resp.json()["enabled"] is True

    def test_disable_2fa_success(self, client, auth_headers):
        """Test disabling 2FA."""
        # Enable and verify first
        resp = client.post(
            "/api/v1/2fa/enable",
            json={"password": "testpassword123"},
            headers=auth_headers
        )
        secret = resp.json()["secret"]
        totp = pyotp.TOTP(secret)
        client.post(
            "/api/v1/2fa/verify",
            json={"code": totp.now()},
            headers=auth_headers
        )
        
        # Now disable
        response = client.post(
            "/api/v1/2fa/disable",
            json={"password": "testpassword123", "code": totp.now()},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["message"] == "2FA disabled successfully"
        
        # Verify status is disabled
        status_resp = client.get("/api/v1/2fa/status", headers=auth_headers)
        assert status_resp.json()["enabled"] is False
