from fastapi import status
from app.main import app

def test_app_initialization():
    """Verify that the FastAPI app initializes correctly."""
    assert app.title == "Londoolink AI Backend"
    assert app.version == "0.1.0"

def test_root_endpoint(client):
    """Verify that the root endpoint is accessible."""
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Londoolink AI Backend is running!"

def test_api_routes_included(client):
    """Verify that major API routes are included in the app."""
    # Check a few key endpoints from different routers
    endpoints = [
        "/api/v1/auth/login",
        "/api/v1/agent/health",
        "/api/v1/2fa/status",
        "/api/v1/security/health"
    ]
    
    for endpoint in endpoints:
        # We just check if they don't return 404
        # (They might return 405 or 401, but not 404 if the router is registered)
        response = client.get(endpoint)
        assert response.status_code != status.HTTP_404_NOT_FOUND, f"Endpoint {endpoint} not found"
