from pydantic import BaseModel, Field
from typing import Optional, List


class TwoFactorEnableRequest(BaseModel):
    password: str = Field(..., description="User's password for verification")


class TwoFactorEnableResponse(BaseModel):
    secret: str
    qr_code: str  # Base64 encoded QR code image
    backup_codes: List[str]


class TwoFactorVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, description="6-digit TOTP code")


class TwoFactorDisableRequest(BaseModel):
    password: str = Field(..., description="User's password for verification")
    code: str = Field(..., min_length=6, max_length=6, description="6-digit TOTP code")


class TwoFactorStatusResponse(BaseModel):
    enabled: bool
    backup_codes_remaining: Optional[int] = None
