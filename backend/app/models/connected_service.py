from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.db.base import Base


class ConnectedService(Base):
    __tablename__ = "connected_services"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    service_type = Column(String(50), nullable=False)  # gmail, outlook, whatsapp, sms
    service_identifier = Column(String(255), nullable=False)  # email address, phone number
    encrypted_credentials = Column(Text, nullable=True)  # OAuth tokens, API keys
    vault_backed = Column(Boolean, default=False, nullable=False)  # True when token is in Auth0 Token Vault
    auth0_sub = Column(String(255), nullable=True, index=True)  # Auth0 subject identifier
    granted_scopes = Column(Text, nullable=True)  # JSON array of granted scopes e.g. '["gmail.readonly"]'
    last_token_used = Column(DateTime(timezone=True), nullable=True)  # populated by AuditLogService
    is_active = Column(Boolean, default=True, nullable=False)
    last_sync = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<ConnectedService(user_id={self.user_id}, type={self.service_type}, active={self.is_active})>"
