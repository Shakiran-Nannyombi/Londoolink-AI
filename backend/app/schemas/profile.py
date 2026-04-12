from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    timezone: Optional[str] = None
    language_preference: Optional[str] = None
    profile_picture_url: Optional[str] = None


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    timezone: str
    language_preference: str
    profile_picture_url: Optional[str] = None
    created_at: datetime


class SettingsUpdate(BaseModel):
    timezone: Optional[str] = None
    language_preference: Optional[str] = None
    notification_preferences: Optional[dict] = None


class SettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    timezone: str
    language_preference: str
    notification_preferences: Optional[dict] = None


class ConsentCreate(BaseModel):
    service_type: str = Field(..., description="Type of service: email, whatsapp, sms, data_processing")
    consent_given: bool = Field(default=True)


class ConsentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    service_type: str
    consent_given: bool
    consent_date: datetime
    revoked_date: Optional[datetime] = None


class ConsentRevoke(BaseModel):
    service_type: str
