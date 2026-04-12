from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Literal
from datetime import datetime


class IntegrationStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    service_type: str
    is_connected: bool
    service_provider: Optional[str] = None
    connected_at: Optional[datetime] = None
    last_synced: Optional[datetime] = None
    vault_backed: Optional[bool] = None
    granted_scopes: Optional[str] = None
    last_token_used: Optional[datetime] = None
    auth0_sub: Optional[str] = None


class OAuthConnectResponse(BaseModel):
    auth_url: str


class OAuthDisconnectResponse(BaseModel):
    message: str
    service_type: str


class EmailConnectRequest(BaseModel):
    provider: Literal['gmail', 'outlook'] = Field(..., description="Email provider")
    authorization_code: Optional[str] = Field(None, description="OAuth authorization code")



class SMSConnectRequest(BaseModel):
    provider: Literal['twilio', 'messagebird'] = Field(..., description="SMS provider")
    api_key: Optional[str] = Field(None, description="API key for SMS service")
    api_secret: Optional[str] = Field(None, description="API secret if required")
    phone_number: Optional[str] = Field(None, description="Phone number to use")


class IntegrationDisconnectResponse(BaseModel):
    message: str
    service_type: str
