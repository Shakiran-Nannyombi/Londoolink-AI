from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class UserConsent(Base):
    __tablename__ = "user_consents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    service_type = Column(String(50), nullable=False)  # email, whatsapp, sms, data_processing
    consent_given = Column(Boolean, default=False, nullable=False)
    consent_date = Column(DateTime(timezone=True), server_default=func.now())
    revoked_date = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<UserConsent(user_id={self.user_id}, service={self.service_type}, given={self.consent_given})>"
