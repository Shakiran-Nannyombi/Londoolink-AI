from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    auth0_sub = Column(String(255), nullable=False, index=True)
    agent_name = Column(String(100), nullable=False)
    event_type = Column(String(50), nullable=False)  # "token_retrieval" | "high_stakes_action" | "unauthorized_scope"
    service_type = Column(String(50), nullable=False)
    scope_used = Column(String(255), nullable=True)
    action_type = Column(String(100), nullable=True)
    outcome = Column(String(50), nullable=False)  # "success" | "failure" | "denied"
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # No updated_at — append-only
