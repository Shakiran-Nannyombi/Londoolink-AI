from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import httpx

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin
from app.security.jwt import create_access_token, get_current_user
from app.security.password import hash_password, verify_password

router = APIRouter()


class GoogleLoginRequest(BaseModel):
    id_token: str


class Auth0CallbackRequest(BaseModel):
    code: str
    redirect_uri: str


@router.post("/register", response_model=dict)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Register a new user
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Hash the password
    hashed_password = hash_password(user.password)

    # Create new user
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {
        "message": "User registered successfully",
        "user_id": db_user.id,
        "email": db_user.email,
    }


@router.post("/login", response_model=Token)
async def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # Login user and return JWT token
    # Find user by email
    user = db.query(User).filter(User.email == user_credentials.email).first()

    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/google-login", response_model=Token)
async def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with Google ID token (legacy flow)."""
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Use /auth/google/callback with Auth0 instead."
    )


@router.post("/callback", response_model=Token)
@router.post("/google/callback", response_model=Token)
async def google_auth0_callback(
    request: Auth0CallbackRequest,
    db: Session = Depends(get_db),
):
    """Exchange Auth0 authorization code for a Londoolink JWT.

    Called by the frontend after Auth0 redirects back with a code.
    Exchanges the code for Auth0 tokens, extracts the user profile,
    upserts the user in the DB, and returns a Londoolink access token.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as http:
            resp = await http.post(
                f"https://{settings.AUTH0_DOMAIN}/oauth/token",
                json={
                    "grant_type": "authorization_code",
                    "client_id": settings.AUTH0_CLIENT_ID,
                    "client_secret": settings.AUTH0_CLIENT_SECRET,
                    "code": request.code,
                    "redirect_uri": request.redirect_uri,
                },
            )

        if resp.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Auth0 token exchange failed")

        token_data = resp.json()
        id_token_str = token_data.get("id_token")
        auth0_access_token = token_data.get("access_token")

        # Get user info from Auth0
        async with httpx.AsyncClient(timeout=10.0) as http:
            userinfo_resp = await http.get(
                f"https://{settings.AUTH0_DOMAIN}/userinfo",
                headers={"Authorization": f"Bearer {auth0_access_token}"},
            )

        if userinfo_resp.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Failed to get user info")

        userinfo = userinfo_resp.json()
        email = userinfo.get("email")
        auth0_sub = userinfo.get("sub")
        full_name = userinfo.get("name", "")

        if not email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not provided")

        # Upsert user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                full_name=full_name,
                hashed_password=None,
                is_active=True,
                auth0_sub=auth0_sub,
            )
            db.add(user)
        else:
            if auth0_sub and not user.auth0_sub:
                user.auth0_sub = auth0_sub
        db.commit()
        db.refresh(user)

        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return {"access_token": access_token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the current authenticated user's profile."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "auth0_sub": current_user.auth0_sub,
        "is_active": current_user.is_active,
    }

