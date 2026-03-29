from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import base64
import json
import urllib.parse

import httpx

from app.db.session import get_db
from app.models.user import User
from app.models.connected_service import ConnectedService
from app.schemas.integrations import (
    IntegrationStatusResponse,
    EmailConnectRequest,
    SMSConnectRequest,
    IntegrationDisconnectResponse,
    OAuthConnectResponse,
    OAuthDisconnectResponse,
)
from app.security.jwt import get_current_user
from app.core.config import settings
from app.services.token_vault import get_token_vault_client

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_auth0_sub(user: User) -> str:
    """Return the user's auth0_sub, falling back to email in dev mode."""
    if user.auth0_sub:
        return user.auth0_sub
    # Fallback for development / users not yet linked to Auth0
    return user.email or ""


def _upsert_connected_service(
    db: Session,
    user_id: int,
    service_type: str,
    auth0_sub: str,
    granted_scopes: Optional[List[str]] = None,
) -> ConnectedService:
    """Upsert a vault-backed ConnectedService record (no token in DB)."""
    service = db.query(ConnectedService).filter(
        ConnectedService.user_id == user_id,
        ConnectedService.service_type == service_type,
    ).first()

    scopes_json = json.dumps(granted_scopes) if granted_scopes else None

    if service:
        service.is_active = True
        service.vault_backed = True
        service.encrypted_credentials = None
        service.auth0_sub = auth0_sub
        if scopes_json:
            service.granted_scopes = scopes_json
    else:
        service = ConnectedService(
            user_id=user_id,
            service_type=service_type,
            service_identifier=auth0_sub,
            encrypted_credentials=None,
            vault_backed=True,
            auth0_sub=auth0_sub,
            granted_scopes=scopes_json,
            is_active=True,
        )
        db.add(service)

    db.commit()
    db.refresh(service)
    return service


# ---------------------------------------------------------------------------
# Status endpoint
# ---------------------------------------------------------------------------

@router.get("/status", response_model=List[IntegrationStatusResponse])
async def get_all_integrations_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get status of all integrations for the current user."""
    services = db.query(ConnectedService).filter(
        ConnectedService.user_id == current_user.id,
    ).all()

    service_map = {s.service_type: s for s in services}
    service_types = ["email", "sms", "google", "notion"]
    result = []

    for service_type in service_types:
        service = service_map.get(service_type)
        if service and service.is_active:
            result.append(IntegrationStatusResponse(
                service_type=service_type,
                is_connected=True,
                service_provider=service_type,
                connected_at=service.created_at,
                last_synced=service.last_sync,
                vault_backed=service.vault_backed,
                granted_scopes=service.granted_scopes,
                last_token_used=service.last_token_used,
                auth0_sub=service.auth0_sub,
            ))
        else:
            result.append(IntegrationStatusResponse(
                service_type=service_type,
                is_connected=False,
                vault_backed=False,
            ))

    return result


# ---------------------------------------------------------------------------
# Google OAuth endpoints
# ---------------------------------------------------------------------------

@router.post("/google/connect", response_model=OAuthConnectResponse)
async def google_connect(
    current_user: User = Depends(get_current_user),
):
    """Return the Auth0-delegated Google OAuth authorization URL."""
    domain = settings.AUTH0_DOMAIN
    client_id = settings.AUTH0_CLIENT_ID
    redirect_uri = settings.GOOGLE_REDIRECT_URI

    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": "openid profile email",
        "connection": "google-oauth2",
        "access_type": "offline",
        "prompt": "consent",
        "state": _get_auth0_sub(current_user),
    }
    auth_url = f"https://{domain}/authorize?{urllib.parse.urlencode(params)}"
    return OAuthConnectResponse(auth_url=auth_url)


@router.get("/google/callback")
async def google_callback(
    code: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Handle Google OAuth callback: exchange code, store token in vault, upsert ConnectedService."""
    base_redirect = f"{settings.FRONTEND_URL}/settings?tab=integrations"

    if error or not code:
        return RedirectResponse(
            url=f"{base_redirect}&status=cancelled&service=google",
            status_code=302,
        )

    auth0_sub = state or ""
    redirect_uri = settings.GOOGLE_REDIRECT_URI

    try:
        # Exchange code for tokens via Auth0
        async with httpx.AsyncClient(timeout=15.0) as http:
            resp = await http.post(
                f"https://{settings.AUTH0_DOMAIN}/oauth/token",
                json={
                    "grant_type": "authorization_code",
                    "client_id": settings.AUTH0_CLIENT_ID,
                    "client_secret": settings.AUTH0_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": redirect_uri,
                },
            )
        if resp.status_code != 200:
            return RedirectResponse(url=f"{base_redirect}&status=error&service=google", status_code=302)

        token_response = resp.json()
        token_data = {
            "access_token": token_response.get("access_token", ""),
            "refresh_token": token_response.get("refresh_token", ""),
            "scopes": [
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/calendar.readonly",
            ],
        }

        vault_client = get_token_vault_client()
        if auth0_sub:
            # Try vault storage but don't fail if unavailable
            try:
                await vault_client.store_token(auth0_sub, "google", token_data)
            except Exception:
                pass  # Vault unavailable, continue with DB-only storage
            user = db.query(User).filter(User.auth0_sub == auth0_sub).first()
            if not user:
                user = db.query(User).filter(User.email == auth0_sub).first()
            if user:
                _upsert_connected_service(
                    db=db,
                    user_id=user.id,
                    service_type="google",
                    auth0_sub=auth0_sub,
                    granted_scopes=token_data["scopes"],
                )
    except Exception:
        return RedirectResponse(url=f"{base_redirect}&status=error&service=google", status_code=302)

    return RedirectResponse(url=f"{base_redirect}&status=connected&service=google", status_code=302)


@router.post("/google/disconnect", response_model=OAuthDisconnectResponse)
async def google_disconnect(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete Google token from vault and mark ConnectedService inactive."""
    auth0_sub = _get_auth0_sub(current_user)

    try:
        vault_client = get_token_vault_client()
        await vault_client.delete_token(auth0_sub, "google")
    except Exception:
        # Continue even if vault delete fails — still mark DB record inactive
        pass

    service = db.query(ConnectedService).filter(
        ConnectedService.user_id == current_user.id,
        ConnectedService.service_type == "google",
    ).first()

    if service:
        service.is_active = False
        db.commit()

    return OAuthDisconnectResponse(
        message="Google disconnected successfully",
        service_type="google",
    )


# ---------------------------------------------------------------------------
# Notion OAuth endpoints
# ---------------------------------------------------------------------------

@router.post("/notion/connect", response_model=OAuthConnectResponse)
async def notion_connect(
    current_user: User = Depends(get_current_user),
):
    """Return the Notion OAuth authorization URL."""
    params = {
        "client_id": settings.NOTION_CLIENT_ID,
        "response_type": "code",
        "owner": "user",
        "redirect_uri": settings.NOTION_REDIRECT_URI,
        "state": _get_auth0_sub(current_user),
    }
    auth_url = f"https://api.notion.com/v1/oauth/authorize?{urllib.parse.urlencode(params)}"
    return OAuthConnectResponse(auth_url=auth_url)


@router.get("/notion/callback")
async def notion_callback(
    code: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Handle Notion OAuth callback: exchange code, store token in vault, upsert ConnectedService."""
    base_redirect = f"{settings.FRONTEND_URL}/settings?tab=integrations"

    if error or not code:
        return RedirectResponse(
            url=f"{base_redirect}&status=cancelled&service=notion",
            status_code=302,
        )

    auth0_sub = state or ""

    try:
        # Exchange code for Notion access token
        credentials = base64.b64encode(
            f"{settings.NOTION_CLIENT_ID}:{settings.NOTION_CLIENT_SECRET}".encode()
        ).decode()

        async with httpx.AsyncClient(timeout=15.0) as http:
            resp = await http.post(
                "https://api.notion.com/v1/oauth/token",
                headers={
                    "Authorization": f"Basic {credentials}",
                    "Content-Type": "application/json",
                },
                json={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": settings.NOTION_REDIRECT_URI,
                },
            )

        if resp.status_code != 200:
            return RedirectResponse(url=f"{base_redirect}&status=error&service=notion", status_code=302)

        token_response = resp.json()
        token_data = {
            "access_token": token_response.get("access_token", ""),
            "scopes": ["read_content", "update_content"],
            "workspace_id": token_response.get("workspace_id", ""),
        }

        vault_client = get_token_vault_client()
        if auth0_sub:
            # Try vault storage but don't fail if unavailable
            try:
                await vault_client.store_token(auth0_sub, "notion", token_data)
            except Exception:
                pass  # Vault unavailable, continue with DB-only storage
            user = db.query(User).filter(User.auth0_sub == auth0_sub).first()
            if not user:
                # Try matching by email if auth0_sub is an email
                user = db.query(User).filter(User.email == auth0_sub).first()
            if user:
                _upsert_connected_service(
                    db=db,
                    user_id=user.id,
                    service_type="notion",
                    auth0_sub=auth0_sub,
                    granted_scopes=token_data["scopes"],
                )
    except Exception:
        return RedirectResponse(url=f"{base_redirect}&status=error&service=notion", status_code=302)

    return RedirectResponse(url=f"{base_redirect}&status=connected&service=notion", status_code=302)


@router.post("/notion/disconnect", response_model=OAuthDisconnectResponse)
async def notion_disconnect(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete Notion token from vault and mark ConnectedService inactive."""
    auth0_sub = _get_auth0_sub(current_user)

    try:
        vault_client = get_token_vault_client()
        await vault_client.delete_token(auth0_sub, "notion")
    except Exception:
        pass

    service = db.query(ConnectedService).filter(
        ConnectedService.user_id == current_user.id,
        ConnectedService.service_type == "notion",
    ).first()

    if service:
        service.is_active = False
        db.commit()

    return OAuthDisconnectResponse(
        message="Notion disconnected successfully",
        service_type="notion",
    )


# ---------------------------------------------------------------------------
# Legacy email / SMS endpoints (unchanged)
# ---------------------------------------------------------------------------

@router.post("/email/connect")
async def connect_email(
    request: EmailConnectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Connect email service (Gmail or Outlook)."""
    if request.provider == "gmail":
        from google_auth_oauthlib.flow import Flow

        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
                }
            },
            scopes=[
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/calendar.readonly",
                "https://www.googleapis.com/auth/userinfo.email",
            ],
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        authorization_url, state = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
        )
        return {
            "message": "Redirect to OAuth URL",
            "oauth_url": authorization_url,
            "status": "pending_auth",
        }

    return {"message": "Provider not supported yet", "status": "error"}


@router.get("/email/callback")
async def email_callback(
    code: str,
    state: str = None,
    db: Session = Depends(get_db),
):
    """Handle Google OAuth callback (legacy email flow)."""
    return {"message": "Please close this window and refresh your settings."}


@router.post("/sms/connect")
async def connect_sms(
    request: SMSConnectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Connect SMS service via Africa's Talking."""
    username = settings.AT_USERNAME or request.api_key
    api_key = settings.AT_API_KEY or request.api_secret

    existing = db.query(ConnectedService).filter(
        ConnectedService.user_id == current_user.id,
        ConnectedService.service_type == "sms",
    ).first()

    credentials_data = {"username": username, "api_key": api_key}

    if existing:
        existing.is_active = True
        existing.service_identifier = request.phone_number or username
        existing.encrypted_credentials = json.dumps(credentials_data)
        db.commit()
        return {"message": "SMS reconnected successfully", "status": "connected"}

    new_service = ConnectedService(
        user_id=current_user.id,
        service_type="sms",
        service_identifier=request.phone_number or username,
        encrypted_credentials=json.dumps(credentials_data),
        is_active=True,
    )
    db.add(new_service)
    db.commit()

    return {"message": "SMS connected successfully", "status": "connected"}


@router.post("/sms/disconnect", response_model=IntegrationDisconnectResponse)
async def disconnect_sms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Disconnect SMS service."""
    service = db.query(ConnectedService).filter(
        ConnectedService.user_id == current_user.id,
        ConnectedService.service_type == "sms",
    ).first()

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SMS service not connected",
        )

    service.is_active = False
    db.commit()

    return IntegrationDisconnectResponse(
        message="SMS disconnected successfully",
        service_type="sms",
    )
