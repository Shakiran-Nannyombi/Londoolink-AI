from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class IntegrationStatusResponse(BaseModel):
    service_type: Literal['email', 'whatsapp', 'sms']
    is_connected: bool
    service_provider: Optional[str] = None
    connected_at: Optional[datetime] = None
    last_synced: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class EmailConnectRequest(BaseModel):
    provider: Literal['gmail', 'outlook'] = Field(..., description="Email provider")
    authorization_code: Optional[str] = Field(None, description="OAuth authorization code")


class WhatsAppConnectRequest(BaseModel):
    phone_number: str = Field(..., description="WhatsApp phone number")
    verification_code: Optional[str] = Field(None, description="Verification code")


class SMSConnectRequest(BaseModel):
    provider: Literal['twilio', 'messagebird'] = Field(..., description="SMS provider")
    api_key: str = Field(..., description="API key for SMS service")
    api_secret: Optional[str] = Field(None, description="API secret if required")
    phone_number: Optional[str] = Field(None, description="Phone number to use")


class IntegrationDisconnectResponse(BaseModel):
    message: str
    service_type: str
