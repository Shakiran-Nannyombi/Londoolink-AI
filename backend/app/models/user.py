from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    is_active = Column(Boolean, default=True, nullable=False)
    
    # New fields for enhanced functionality
    phone_number = Column(String(20), nullable=True, index=True)
    profile_picture_url = Column(String(500), nullable=True)
    timezone = Column(String(50), default="UTC")
    language_preference = Column(String(10), default="en")
    notification_preferences = Column(Text, nullable=True)  # JSON stored as text

    # Two-Factor Authentication
    two_factor_enabled = Column(Boolean, default=False, nullable=False)
    two_factor_secret = Column(String(32), nullable=True)  # TOTP secret
    backup_codes = Column(Text, nullable=True)  # JSON array of backup codes

    # Encrypted credentials storage
    encrypted_google_token = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"
