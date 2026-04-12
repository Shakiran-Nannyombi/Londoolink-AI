"""
Audit log API endpoints.

GET /api/v1/audit  — returns recent audit log entries for the authenticated user
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.security.jwt import get_current_user
from app.services.audit_log import AuditLogService

router = APIRouter()


# ---------------------------------------------------------------------------
# Response schema
# ---------------------------------------------------------------------------


class AuditLogEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    auth0_sub: str
    agent_name: str
    event_type: str
    service_type: str
    scope_used: Optional[str]
    action_type: Optional[str]
    outcome: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("", response_model=list[AuditLogEntryResponse])
async def get_audit_log(
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AuditLogEntryResponse]:
    """Return recent audit log entries for the authenticated user."""
    auth0_sub = current_user.auth0_sub or current_user.email or ""
    service = AuditLogService(db)
    entries = await service.get_recent_entries(auth0_sub=auth0_sub, limit=limit)
    return entries
