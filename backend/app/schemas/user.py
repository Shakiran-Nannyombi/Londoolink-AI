from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    full_name: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    full_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class UserInDB(User):
    hashed_password: str
    encrypted_google_token: Optional[str] = None
