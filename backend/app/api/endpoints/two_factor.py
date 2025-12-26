from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import pyotp
import qrcode
import io
import base64
import json
import secrets

from app.db.session import get_db
from app.models.user import User
from app.schemas.two_factor import (
    TwoFactorEnableRequest,
    TwoFactorEnableResponse,
    TwoFactorVerifyRequest,
    TwoFactorDisableRequest,
    TwoFactorStatusResponse
)
from app.security.jwt import get_current_user
from app.security.password import verify_password

router = APIRouter()


def generate_backup_codes(count: int = 10) -> list[str]:
    """Generate backup codes for 2FA recovery."""
    return [secrets.token_hex(4).upper() for _ in range(count)]


def generate_qr_code(secret: str, user_email: str) -> str:
    """Generate QR code for TOTP setup."""
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user_email,
        issuer_name="Londoolink AI"
    )
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(totp_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode()


@router.get("/status", response_model=TwoFactorStatusResponse)
async def get_2fa_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get 2FA status for current user."""
    backup_codes_count = None
    if current_user.two_factor_enabled and current_user.backup_codes:
        try:
            codes = json.loads(current_user.backup_codes)
            backup_codes_count = len(codes)
        except:
            backup_codes_count = 0
    
    return TwoFactorStatusResponse(
        enabled=current_user.two_factor_enabled,
        backup_codes_remaining=backup_codes_count
    )


@router.post("/enable", response_model=TwoFactorEnableResponse)
async def enable_2fa(
    request: TwoFactorEnableRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enable 2FA for the current user."""
    # Verify password
    if not current_user.hashed_password or not verify_password(
        request.password, current_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    if current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already enabled"
        )
    
    # Generate secret and backup codes
    secret = pyotp.random_base32()
    backup_codes = generate_backup_codes()
    
    # Generate QR code
    qr_code = generate_qr_code(secret, current_user.email)
    
    # Save to database (not enabled yet - user must verify first)
    current_user.two_factor_secret = secret
    current_user.backup_codes = json.dumps(backup_codes)
    db.commit()
    
    return TwoFactorEnableResponse(
        secret=secret,
        qr_code=f"data:image/png;base64,{qr_code}",
        backup_codes=backup_codes
    )


@router.post("/verify")
async def verify_2fa_setup(
    request: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify 2FA code and complete setup."""
    if not current_user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA setup not initiated"
        )
    
    # Verify the code
    totp = pyotp.TOTP(current_user.two_factor_secret)
    if not totp.verify(request.code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Enable 2FA
    current_user.two_factor_enabled = True
    db.commit()
    
    return {"message": "2FA enabled successfully"}


@router.post("/disable")
async def disable_2fa(
    request: TwoFactorDisableRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disable 2FA for the current user."""
    # Verify password
    if not current_user.hashed_password or not verify_password(
        request.password, current_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    if not current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled"
        )
    
    # Verify 2FA code
    totp = pyotp.TOTP(current_user.two_factor_secret)
    if not totp.verify(request.code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Disable 2FA
    current_user.two_factor_enabled = False
    current_user.two_factor_secret = None
    current_user.backup_codes = None
    db.commit()
    
    return {"message": "2FA disabled successfully"}


@router.post("/verify-login")
async def verify_2fa_login(
    request: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify 2FA code during login."""
    if not current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled for this user"
        )
    
    # Verify the code
    totp = pyotp.TOTP(current_user.two_factor_secret)
    if totp.verify(request.code, valid_window=1):
        return {"verified": True, "message": "2FA verification successful"}
    
    # Check backup codes
    if current_user.backup_codes:
        try:
            backup_codes = json.loads(current_user.backup_codes)
            if request.code.upper() in backup_codes:
                # Remove used backup code
                backup_codes.remove(request.code.upper())
                current_user.backup_codes = json.dumps(backup_codes)
                db.commit()
                return {"verified": True, "message": "Backup code accepted"}
        except:
            pass
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid verification code"
    )
