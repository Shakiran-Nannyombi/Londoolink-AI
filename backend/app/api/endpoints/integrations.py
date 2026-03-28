from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json
import urllib.parse

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
    domain = settings.AUTH0_DOMAIN or "YOUR_AUTH0_DOMAIN"
    client_id = settings.AUTH0_CLIENT_ID or "YOUR_CLIENT_ID"
    frontend_url = settings.FRONTEND_URL or "http://localhost:3000"

    # Build the callback URL that Auth0 will redirect to after consent
    redirect_uri = f"{frontend_url}/api/v1/integrations/google/callback"

    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": "openid profile email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly",
        "connection": "google-oauth2",
        "access_type": "offline",
        "prompt": "consent",
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
    """Handle Google OAuth callback: store token in vault, upsert ConnectedService."""
    frontend_url = settings.FRONTEND_URL or "http://localhost:3000"
    base_redirect = f"{frontend_url}/settings?tab=integrations"

    if error or not code:
        return RedirectResponse(
            url=f"{base_redirect}&status=cancelled&service=google",
            status_code=302,
        )

    # TODO: Exchange `code` for tokens via Auth0 Token Vault SDK
    # token_response = await auth0_exchange_code(code, redirect_uri=...)
    # For now we build a placeholder token_data structure
    token_data = {
        "access_token": f"google_access_token_placeholder_{code[:8]}",
        "refresh_token": f"google_refresh_token_placeholder",
        "scopes": [
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/calendar.readonly",
        ],
    }

    # We need the user from state (in production, encode user_id in state param)
    # For now, attempt to find user via state or skip vault store gracefully
    auth0_sub = state or ""

    try:
        vault_client = get_token_vault_client()
        if auth0_sub:
            await vault_client.store_token(auth0_sub, "google", token_data)

            # Upsert ConnectedService — find user by auth0_sub
            user = db.query(User).filter(User.auth0_sub == auth0_sub).first()
            if user:
                _upsert_connected_service(
                    db=db,
                    user_id=user.id,
                    service_type="google",
                    auth0_sub=auth0_sub,
                    granted_scopes=token_data["scopes"],
                )
    except Exception:
        # Non-fatal in dev mode; redirect with error status
        return RedirectResponse(
            url=f"{base_redirect}&status=error&service=google",
            status_code=302,
        )

    return RedirectResponse(
        url=f"{base_redirect}&status=connected&service=google",
        status_code=302,
    )


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
    notion_client_id = settings.NOTION_CLIENT_ID or "YOUR_NOTION_CLIENT_ID"
    redirect_uri = settings.NOTION_REDIRECT_URI or "http://localhost:8000/api/v1/integrations/notion/callback"

    params = {
        "client_id": notion_client_id,
        "response_type": "code",
        "owner": "user",
        "redirect_uri": redirect_uri,
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
    """Handle Notion OAuth callback: store token in vault, upsert ConnectedService."""
    frontend_url = settings.FRONTEND_URL or "http://localhost:3000"
    base_redirect = f"{frontend_url}/settings?tab=integrations"

    if error or not code:
        return RedirectResponse(
            url=f"{base_redirect}&status=cancelled&service=notion",
            status_code=302,
        )

    # TODO: Exchange `code` for Notion access token
    # POST https://api.notion.com/v1/oauth/token with Basic auth (client_id:client_secret)
    token_data = {
        "access_token": f"notion_access_token_placeholder_{code[:8]}",
        "scopes": ["read_content", "update_content"],
    }

    auth0_sub = state or ""

    try:
        vault_client = get_token_vault_client()
        if auth0_sub:
            await vault_client.store_token(auth0_sub, "notion", token_data)

            user = db.query(User).filter(User.auth0_sub == auth0_sub).first()
            if user:
                _upsert_connected_service(
                    db=db,
                    user_id=user.id,
                    service_type="notion",
                    auth0_sub=auth0_sub,
                    granted_scopes=token_data["scopes"],
                )
    except Exception:
        return RedirectResponse(
            url=f"{base_redirect}&status=error&service=notion",
            status_code=302,
        )

    return RedirectResponse(
        url=f"{base_redirect}&status=connected&service=notion",
        status_code=302,
    )


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
    """Connect SMS service (Twilio or MessageBird)."""
    api_key = request.api_key
    api_secret = request.api_secret
    phone_number = request.phone_number

    if request.provider == "twilio":
        if not api_key:
            api_key = settings.TWILIO_ACCOUNT_SID
        if not api_secret:
            api_secret = settings.TWILIO_AUTH_TOKEN
        if not phone_number:
            phone_number = settings.TWILIO_PHONE_NUMBER

    existing = db.query(ConnectedService).filter(
        ConnectedService.user_id == current_user.id,
        ConnectedService.service_type == "sms",
    ).first()

    credentials_data = {"api_key": api_key, "api_secret": api_secret}

    if existing:
        existing.is_active = True
        existing.service_identifier = phone_number
        existing.encrypted_credentials = json.dumps(credentials_data)
        db.commit()
        return {"message": f"{request.provider} reconnected successfully", "status": "connected"}

    new_service = ConnectedService(
        user_id=current_user.id,
        service_type="sms",
        service_identifier=phone_number,
        encrypted_credentials=json.dumps(credentials_data),
        is_active=True,
    )
    db.add(new_service)
    db.commit()

    return {"message": f"{request.provider} connected successfully", "status": "connected"}


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
